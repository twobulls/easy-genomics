import {
  ConditionalCheckFailedException,
  TransactionCanceledException,
} from '@aws-sdk/client-dynamodb';
import { CreateUserInviteSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-invite';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { CreateUserInvite } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-invite';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { CognitoUserService } from '../../../services/easy-genomics/cognito-user-service';
import { OrganizationService } from '../../../services/easy-genomics/organization-service';
import { OrganizationUserService } from '../../../services/easy-genomics/organization-user-service';
import { PlatformUserService } from '../../../services/easy-genomics/platform-user-service';
import { UserService } from '../../../services/easy-genomics/user-service';

const cognitoUserService = new CognitoUserService({ userPoolId: process.env.COGNITO_USER_POOL_ID });
const organizationService = new OrganizationService();
const organizationUserService = new OrganizationUserService();
const platformUserService = new PlatformUserService();
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
    const user: User | undefined = (await userService.queryByEmail(request.Email)).shift();

    if (!user) {
      // Attempt to create new Cognito User account
      const newUserId: string = await cognitoUserService.addNewUserToPlatform(request.Email);

      // Create new User and invite to the Organization and Platform
      const newUser: User = getNewUser(request.Email, newUserId, currentUserId);
      const newOrganizationUser: OrganizationUser = getNewOrganizationUser(organization.OrganizationId, newUser.UserId, currentUserId);

      try {
        // Attempt to add the new User record, and add the Organization-User access mapping in one transaction
        if (await platformUserService.addNewUserToOrganization({
          ...newUser,
          OrganizationAccess: { [organization.OrganizationId]: [] },
        }, newOrganizationUser)) {
          // TODO: Send email
          return buildResponse(200, JSON.stringify({ Status: 'Success' }), event);
        }
      } catch (error: unknown) {
        // Clean up the created Cognito User account due to failure in creating new User record / Organization-User access mapping.
        await cognitoUserService.deleteUserFromPlatform(request.Email);
        return buildResponse(200, JSON.stringify({ Status: 'Error', Message: error.message }), event);
      }
    } else {
      // Invite existing User to the Organization
      if (user.Status === 'Inactive') {
        throw new Error(`Unable to invite User to Organization "${organization.Name}": User Status is "Inactive"`);
      } else {
        const existingOrganizationUser: OrganizationUser | void =
          await organizationUserService.get(organization.OrganizationId, user.UserId).catch((error: any) => {
            if (error.message.endsWith('Resource not found')) { // TODO - improve error to handle ResourceNotFoundException instead of checking error message
              // Do nothing - allow new Organization-User access mapping to proceed.
            } else {
              throw error;
            }
          });

        if (existingOrganizationUser && existingOrganizationUser.Status === 'Invited') {
          // Check if existing Organization-User's Status is still Invited to resend invitation
          // TODO: Re-send email
          return buildResponse(200, JSON.stringify({ Status: 'Re-inviting' }), event);
        } else {
          // Create new Organization-User access mapping record
          const newOrganizationUser = getNewOrganizationUser(organization.OrganizationId, user.UserId, currentUserId);

          // Attempt to add the User to the Organization in one transaction
          if (await platformUserService.addExistingUserToOrganization({
            ...user,
            OrganizationAccess: {
              ...user.OrganizationAccess,
              [organization.OrganizationId]: [],
            },
            ModifiedAt: new Date().toISOString(),
            ModifiedBy: currentUserId,
          }, newOrganizationUser)) {
            // TODO: Re-send email
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