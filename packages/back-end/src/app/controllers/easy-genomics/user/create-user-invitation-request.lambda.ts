import { createHmac } from 'crypto';
import { ConditionalCheckFailedException, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { CreateUserInvitationRequestSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-invitation';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { CreateUserInvitationRequest } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-invitation';
import { UserInvitationJwt } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-verification-jwt';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { CognitoIdpService } from '@BE/services/cognito-idp-service';
import { OrganizationService } from '@BE/services/easy-genomics/organization-service';
import { OrganizationUserService } from '@BE/services/easy-genomics/organization-user-service';
import { PlatformUserService } from '@BE/services/easy-genomics/platform-user-service';
import { UserService } from '@BE/services/easy-genomics/user-service';
import { SesService } from '@BE/services/ses-service';
import { generateJwt } from '@BE/utils/jwt-utils';

const cognitoIdpService = new CognitoIdpService({ userPoolId: process.env.COGNITO_USER_POOL_ID });
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
    const request: CreateUserInvitationRequest = event.isBase64Encoded
      ? JSON.parse(atob(event.body!))
      : JSON.parse(event.body!);

    // Data validation safety check
    if (!CreateUserInvitationRequestSchema.safeParse(request).success) throw new Error('Invalid request');

    // Check if Organization & User records exists
    const organization: Organization = await organizationService.get(request.OrganizationId); // Throws error if not found
    const existingUser: User | undefined = (await userService.queryByEmail(request.Email)).shift();

    if (!existingUser) {
      // Attempt to create new Cognito User account - will trigger Cognito process-custom-email-sender to send SES email template
      const newUserId: string = await cognitoIdpService.adminCreateUser(
        request.Email,
        organization.OrganizationId,
        organization.Name,
      );

      // Create new User and invite to the Organization and Platform
      const newUser: User = getNewUser(request.Email, newUserId, currentUserId);
      const newOrganizationUser: OrganizationUser = getNewOrganizationUser(
        organization.OrganizationId,
        newUser.UserId,
        currentUserId,
      );

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
        const existingOrganizationUser: OrganizationUser | void = await organizationUserService
          .get(organization.OrganizationId, existingUser.UserId)
          .catch((error: any) => {
            if (error.message.endsWith('Resource not found')) {
              // TODO - improve error to handle ResourceNotFoundException instead of checking error message
              // Do nothing - allow new Organization-User access mapping to proceed.
            } else {
              throw error;
            }
          });

        // Check if existing Organization-User's Status is still Invited to resend invitation
        if (existingOrganizationUser) {
          if (existingOrganizationUser.Status !== 'Invited') {
            // Existing Organization-User's Status is either Inactive or Active
            throw new Error(
              `Unable to re-invite User to Organization "${organization.Name}": User Organization Status is "${existingOrganizationUser.Status}"`,
            );
          }

          // Attempt to resend new Cognito User account - will trigger Cognito process-custom-email-sender to send SES email template
          await cognitoIdpService.adminCreateUser(request.Email, organization.OrganizationId, organization.Name, true); // Resend
          return buildResponse(200, JSON.stringify({ Status: 'Re-inviting' }), event);
        } else {
          // Create new Organization-User access mapping record
          const newOrganizationUser = getNewOrganizationUser(
            organization.OrganizationId,
            existingUser.UserId,
            currentUserId,
          );

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
            await sesService.sendUserInvitationEmail(
              request.Email,
              organization.Name,
              generateExistingUserInvitationJwt(existingUser.Email, existingUser.UserId, organization.OrganizationId),
            );
            return buildResponse(200, JSON.stringify({ Status: 'Success' }), event);
          }
        }
      }
    }
  } catch (err: any) {
    console.error(err);
    return buildResponse(400, JSON.stringify({ Error: getErrorMessage(err) }), event);
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
    Email: email.toLowerCase(),
    Status: 'Invited',
    CreatedAt: new Date().toISOString(),
    CreatedBy: createdBy,
  };
  return newUser;
}

/**
 * Helper function to generate an Existing User Invitation JWT to send in an
 * invitation email and used to verify User Invitation acceptance.
 * @param email
 * @param userId
 * @param organizationId
 */
function generateExistingUserInvitationJwt(email: string, userId: string, organizationId: string): string {
  const createdAt: number = Date.now(); // Salt
  const existingUserInvitationJwt: UserInvitationJwt = {
    RequestType: 'ExistingUserInvitation',
    Verification: createHmac('sha256', process.env.JWT_SECRET_KEY + createdAt)
      .update(userId + organizationId)
      .digest('hex'),
    OrganizationId: organizationId,
    Email: email,
    CreatedAt: createdAt,
  };
  return generateJwt(existingUserInvitationJwt, process.env.JWT_SECRET_KEY, '7 d');
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

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  if (err instanceof ConditionalCheckFailedException) {
    return `Create User Invite to Organization failed: ${err.message}`;
  } else if (err instanceof TransactionCanceledException) {
    return `Create User Invite to Organization failed: ${err.message}`;
  } else {
    return err.message;
  }
}
