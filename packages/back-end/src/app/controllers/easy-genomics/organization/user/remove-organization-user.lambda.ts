import { RemoveOrganizationUserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/organization-user';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import {
  LaboratoryAccess,
  OrganizationAccess,
  OrganizationAccessDetails,
  User,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { InvalidRequestError, UnauthorizedAccessError } from '@easy-genomics/shared-lib/src/app/utils/HttpError';
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
    if (!RemoveOrganizationUserSchema.safeParse(request).success) throw new InvalidRequestError();

    // Only System Admins or Organisation Admins are allowed to remove Org users
    if (!(validateSystemAdminAccess(event) || validateOrganizationAdminAccess(event, request.OrganizationId))) {
      throw new UnauthorizedAccessError();
    }

    // Lookup by OrganizationId & UserId to confirm existence before updating
    const organizationUser: OrganizationUser = await organizationUserService.get(
      request.OrganizationId,
      request.UserId,
    );
    const user: User = await userService.get(request.UserId);

    // Retrieve the User's OrganizationAccess metadata to update
    const organizationAccess: OrganizationAccess | undefined = user.OrganizationAccess;
    // Retrieve the current Organization's OrganizationAccessDetails for use in the update
    const organizationAccessDetails: OrganizationAccessDetails | undefined =
      organizationAccess && organizationAccess[organizationUser.OrganizationId]
        ? organizationAccess[organizationUser.OrganizationId]
        : undefined;
    // Retrieve the current Organization's LaboratoryAccess details for use in the update
    const laboratoryAccess: LaboratoryAccess | undefined = organizationAccessDetails
      ? organizationAccessDetails.LaboratoryAccess
      : undefined;

    if (organizationAccess) {
      delete organizationAccess[organizationUser.OrganizationId];
    }

    const response: boolean = await platformUserService.removeExistingUserFromOrganization(
      {
        ...user,
        OrganizationAccess: <OrganizationAccess>{
          ...organizationAccess,
        },
        ModifiedAt: new Date().toISOString(),
        ModifiedBy: currentUserId,
      },
      organizationUser,
      laboratoryAccess,
    );
    if (response) {
      return buildResponse(200, JSON.stringify({ Status: 'Success' }), event);
    }
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
