import { CreateUserInvitationRequestSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-invitation';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { CreateUserInvitationRequest } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-invitation';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { CognitoIdpService } from '@BE/services/cognito-idp-service';
import { OrganizationService } from '@BE/services/easy-genomics/organization-service';
import { OrganizationUserService } from '@BE/services/easy-genomics/organization-user-service';
import { PlatformUserService } from '@BE/services/easy-genomics/platform-user-service';
import { UserService } from '@BE/services/easy-genomics/user-service';
import { SesService } from '@BE/services/ses-service';

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
      // New User processing logic
      await inviteNewUserToOrganization(organization, request.Email, currentUserId);
      return buildResponse(200, JSON.stringify({ Status: 'Success' }), event);
    } else {
      // Existing User processing logic
      switch (existingUser.Status) {
        case 'Invited': // Existing User's Status is still 'Invited' so continue to treat as New User and resend invite
          await inviteNewUserToOrganization(organization, request.Email, currentUserId, true);
          return buildResponse(200, JSON.stringify({ Status: 'Re-inviting' }), event);
        case 'Active':
          await inviteExistingUserToOrganization(organization, existingUser, currentUserId);
          return buildResponse(200, JSON.stringify({ Status: 'Success' }), event);
        default:
          throw new Error(
            `Unable to invite User to Organization "${organization.Name}": User Status is "${existingUser.Status}"`,
          );
      }
    }
  } catch (error: any) {
    console.error(error);
    return buildErrorResponse(error, event);
  }
};

async function inviteNewUserToOrganization(
  organization: Organization,
  email: string,
  createdBy: string,
  resend?: boolean,
) {
  // Attempt to create new Cognito User account - will trigger Cognito process-custom-email-sender to send SES email template
  const userId: string = await cognitoIdpService.adminCreateUser(
    email.toLowerCase(),
    organization.OrganizationId,
    organization.Name,
    resend,
  );

  if (!resend) {
    // Attempt to add the new User record, and add the Organization-User access mapping in one transaction
    await platformUserService.addNewUserToOrganization(
      {
        UserId: userId,
        Email: email.toLowerCase(),
        Status: 'Invited',
        CreatedAt: new Date().toISOString(),
        CreatedBy: createdBy,
      },
      {
        OrganizationId: organization.OrganizationId,
        UserId: userId,
        Status: 'Invited',
        OrganizationAdmin: false,
        CreatedAt: new Date().toISOString(),
        CreatedBy: createdBy,
      },
    );
  }
}

async function inviteExistingUserToOrganization(organization: Organization, user: User, modifiedBy: string) {
  // Try to find existing OrganizationUser record
  const existingOrganizationUser: OrganizationUser | void = await organizationUserService
    .get(organization.OrganizationId, user.UserId)
    .catch(() => {});

  if (existingOrganizationUser && existingOrganizationUser.Status === 'Active') {
    return; // Do nothing
  }

  const organizationUser: OrganizationUser = existingOrganizationUser
    ? {
        ...existingOrganizationUser,
        Status: 'Active',
        ModifiedAt: new Date().toISOString(),
        ModifiedBy: modifiedBy,
      }
    : {
        OrganizationId: organization.OrganizationId,
        UserId: user.UserId,
        Status: 'Active',
        OrganizationAdmin: false,
        CreatedAt: new Date().toISOString(),
        CreatedBy: modifiedBy,
      };

  // Send out courtesy notification email to advise user they have been added to an Organization
  await sesService.sendExistingUserInvitationEmail(user.Email, organization.Name);

  // Attempt to add the new User record, and add the Organization-User access mapping in one transaction
  await platformUserService.addExistingUserToOrganization(
    {
      ...user,
      ModifiedAt: new Date().toISOString(),
      ModifiedBy: modifiedBy,
    },
    organizationUser,
  );
}
