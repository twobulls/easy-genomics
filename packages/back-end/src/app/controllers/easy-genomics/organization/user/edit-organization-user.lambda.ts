import { EditOrganizationUserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/organization-user';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import {
  OrganizationAccess,
  OrganizationAccessDetails,
  User,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  InvalidRequestError,
  OrganizationUserStatusError,
  UnauthorizedAccessError,
} from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { OrganizationUserService } from '@BE/services/easy-genomics/organization-user-service';
import { PlatformUserService } from '@BE/services/easy-genomics/platform-user-service';
import { UserService } from '@BE/services/easy-genomics/user-service';
import { validateOrganizationAdminAccess, validateSystemAdminAccess } from '@BE/utils/auth-utils';

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
    const request: OrganizationUser = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    if (!EditOrganizationUserSchema.safeParse(request).success) throw new InvalidRequestError();

    // Only System Admins or Organisation Admins are allowed to add Org users
    if (!(validateSystemAdminAccess(event) || validateOrganizationAdminAccess(event, request.OrganizationId))) {
      throw new UnauthorizedAccessError();
    }

    // Lookup by OrganizationId & UserId to confirm existence before updating
    const organizationUser: OrganizationUser = await organizationUserService.get(
      request.OrganizationId,
      request.UserId,
    );
    const user: User = await userService.get(request.UserId);

    // Prevent reverting OrganizationUser Status to 'Invited' if already 'Active' or 'Inactive'
    if (organizationUser.Status !== 'Invited' && request.Status === 'Invited') {
      throw new OrganizationUserStatusError(organizationUser.Status);
    }

    // Retrieve the User's OrganizationAccess metadata to update
    const organizationAccess: OrganizationAccess | undefined = user.OrganizationAccess;
    // Retrieve the current Organization's OrganizationAccessDetails for use in the update
    const organizationAccessDetails: OrganizationAccessDetails | undefined =
      organizationAccess && organizationAccess[organizationUser.OrganizationId]
        ? organizationAccess[organizationUser.OrganizationId]
        : undefined;

    const response: boolean = await platformUserService.editExistingUserAccessToOrganization(
      {
        ...user,
        OrganizationAccess: <OrganizationAccess>{
          ...organizationAccess,
          [request.OrganizationId]: <OrganizationAccessDetails>{
            ...organizationAccessDetails,
            Status: request.Status,
            OrganizationAdmin: request.OrganizationAdmin,
          },
        },
        ModifiedAt: new Date().toISOString(),
        ModifiedBy: currentUserId,
      },
      {
        ...organizationUser,
        ...request,
        Status: request.Status,
        ModifiedAt: new Date().toISOString(),
        ModifiedBy: currentUserId,
      },
    );

    if (response) {
      return buildResponse(200, JSON.stringify({ Status: 'Success' }), event);
    }
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
