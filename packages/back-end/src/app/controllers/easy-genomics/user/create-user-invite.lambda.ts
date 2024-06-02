import { createHmac } from 'crypto';
import {
  ConditionalCheckFailedException,
  TransactionCanceledException,
} from '@aws-sdk/client-dynamodb';
import { CreateUserInviteSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-invite';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { UserInvitationJwt } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-invitation-jwt';
import { CreateUserInvite } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-invite';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { CognitoUserService } from '../../../services/easy-genomics/cognito-user-service';
import { OrganizationService } from '../../../services/easy-genomics/organization-service';
import { OrganizationUserService } from '../../../services/easy-genomics/organization-user-service';
import { PlatformUserService } from '../../../services/easy-genomics/platform-user-service';
import { UserService } from '../../../services/easy-genomics/user-service';
import { SesService } from '../../../services/ses-service';
import { generateJwt } from '../../../utils/jwt-utils';

const cognitoUserService = new CognitoUserService({ userPoolId: process.env.COGNITO_USER_POOL_ID });
const organizationService = new OrganizationService();
const organizationUserService = new OrganizationUserService();
const platformUserService = new PlatformUserService();
const sesService = new SesService({
  accountId: process.env.ACCOUNT_ID,
  region: process.env.REGION,
  domainName: process.env.DOMAIN_NAME,
});
const userService = new UserService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const currentUserId: string = event.requestContext.authorizer.claims['cognito:username'];
    // Post Request Body
    const request: CreateUserInvite = (
      event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!)
    );

    // Data validation safety check
    if (!CreateUserInviteSchema.safeParse(request).success) throw new Error('Invalid request');

    // Check if Organization & User records exists
    const organization: Organization = await organizationService.get(request.OrganizationId); // Throws error if not found
    const existingUser: User | undefined = (await userService.queryByEmail(request.Email)).shift();

    if (!existingUser) {
      // Attempt to create new Cognito User account
      const newUserId: string = await cognitoUserService.addNewUserToPlatform(request.Email);

      // Create new User and invite to the Organization and Platform
      const newUser: User = getNewUser(request.Email, newUserId, currentUserId);
      const newOrganizationUser: OrganizationUser = getNewOrganizationUser(organization.OrganizationId, newUser.UserId, currentUserId);

      try {
        const newUserDetails: User = {
          ...newUser,
          OrganizationAccess: {
            [organization.OrganizationId]: {
              Status: newOrganizationUser.Status,
              LaboratoryAccess: {},
            },
          },
        };
        // Attempt to add the new User record, and add the Organization-User access mapping in one transaction
        if (await platformUserService.addNewUserToOrganization(newUserDetails, newOrganizationUser)) {
          const invitationJwt: string = generateUserInvitationJwt(newUserDetails, organization);
          const response = await sesService.sendUserInvitationEmail(request.Email, organization.Name, invitationJwt);
          console.log('Send Invitation Email Response: ', response);
          return buildResponse(200, JSON.stringify({ Status: 'Success' }), event);
        }
      } catch (error: unknown) {
        console.error(error);
        return buildResponse(200, JSON.stringify({ Status: 'Error', Message: error.message }), event);
      }
    } else {
      // Invite existing User to the Organization
      if (existingUser.Status === 'Inactive') {
        throw new Error(`Unable to invite User to Organization "${organization.Name}": User Status is "Inactive"`);
      } else {
        const existingOrganizationUser: OrganizationUser | void =
          await organizationUserService.get(organization.OrganizationId, existingUser.UserId).catch((error: any) => {
            if (error.message.endsWith('Resource not found')) { // TODO - improve error to handle ResourceNotFoundException instead of checking error message
              // Do nothing - allow new Organization-User access mapping to proceed.
            } else {
              throw error;
            }
          });

        // Check if existing Organization-User's Status is still Invited to resend invitation
        if (existingOrganizationUser) {
          if (existingOrganizationUser.Status === 'Invited') {
            const invitationJwt: string = generateUserInvitationJwt(existingUser, organization);
            const response = await sesService.sendUserInvitationEmail(request.Email, organization.Name, invitationJwt);
            console.log('Send Invitation Email Response: ', response);
            return buildResponse(200, JSON.stringify({ Status: 'Re-inviting' }), event);
          } else {
            // Existing Organization-User's Status is either Inactive or Active
            throw new Error(`Unable to re-invite User to Organization "${organization.Name}": User Organization Status is "${existingOrganizationUser.Status}"`);
          }
        } else {
          // Create new Organization-User access mapping record
          const newOrganizationUser = getNewOrganizationUser(organization.OrganizationId, existingUser.UserId, currentUserId);

          const existingUserDetails: User = {
            ...existingUser,
            OrganizationAccess: {
              ...existingUser.OrganizationAccess,
              [organization.OrganizationId]: {
                Status: newOrganizationUser.Status,
                LaboratoryAccess: {},
              },
            },
            ModifiedAt: new Date().toISOString(),
            ModifiedBy: currentUserId,
          };

          // Attempt to add the User to the Organization in one transaction
          if (await platformUserService.addExistingUserToOrganization(existingUserDetails, newOrganizationUser)) {
            const invitationJwt: string = generateUserInvitationJwt(existingUserDetails, organization);
            const response = await sesService.sendUserInvitationEmail(request.Email, organization.Name, invitationJwt);
            console.log('Send Invitation Email Response: ', response);
            return buildResponse(200, JSON.stringify({ Status: 'Success' }), event);
          }
        }
      }
    }
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        Error: getErrorMessage(err),
      }),
    };
  }
};

/**
 * Helper function to create a new User record.
 * @param email
 * @param userId
 * @param createdBy
 */
function getNewUser(email: string, userId: string, createdBy?: string): User {
  const newUser: User = {
    UserId: userId,
    Email: email,
    Status: 'Invited',
    CreatedAt: new Date().toISOString(),
    CreatedBy: createdBy,
  };
  return newUser;
}

/**
 * Helper function to create a new Organization-User access mapping record.
 * @param organizationId
 * @param userId
 * @param createdBy
 */
function getNewOrganizationUser(organizationId, userId: string, createdBy: string): OrganizationUser {
  const organizationUser: OrganizationUser = {
    OrganizationId: organizationId,
    UserId: userId,
    Status: 'Invited',
    OrganizationAdmin: false,
    CreatedAt: new Date().toISOString(),
    CreatedBy: createdBy,
  };
  return organizationUser;
}

/**
 * Helper function to generate User Invitation JWT to send in invitation email
 * and used to verify User invitation acceptance.
 * @organizationName
 * @param user
 * @param organization
 */
function generateUserInvitationJwt(user: User, organization: Organization): string {
  const createdAt: number = Date.now(); // Salt
  const userInvitationJwt: UserInvitationJwt = {
    InvitationCode: createHmac('sha256', process.env.JWT_SECRET_KEY + createdAt)
      .update(user.UserId + organization.OrganizationId)
      .digest('hex'),
    OrganizationId: organization.OrganizationId,
    OrganizationName: organization.Name,
    Email: user.Email,
    CreatedAt: createdAt,
  };
  return generateJwt(userInvitationJwt, process.env.JWT_SECRET_KEY, '7 days');
}

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  if (err instanceof ConditionalCheckFailedException) {
    return `Create User Invite to Organization failed: ${err.message}`;
  } else if (err instanceof TransactionCanceledException) {
    return `Create User Invite to Organization failed: ${err.message}`;
  } else {
    return err.message;
  }
};