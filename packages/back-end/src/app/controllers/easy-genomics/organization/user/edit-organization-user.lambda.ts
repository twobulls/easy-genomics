import { EditOrganizationUserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/organization-user';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import {
  LaboratoryAccess,
  LaboratoryAccessDetails,
  OrganizationAccess,
  OrganizationAccessDetails,
  User,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { OrganizationUserService } from '@BE/services/easy-genomics/organization-user-service';
import { PlatformUserService } from '@BE/services/easy-genomics/platform-user-service';
import { UserService } from '@BE/services/easy-genomics/user-service';

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
    if (!EditOrganizationUserSchema.safeParse(request).success) throw new Error('Invalid request');

    // Lookup by OrganizationId & UserId to confirm existence before updating
    const organizationUser: OrganizationUser = await organizationUserService.get(
      request.OrganizationId,
      request.UserId,
    );
    const user: User = await userService.get(request.UserId);

    // Prevent reverting OrganizationUser Status to 'Invited' if already 'Active' or 'Inactive'
    if (organizationUser.Status !== 'Invited' && request.Status === 'Invited') {
      throw new Error(
        `User Organization Status already '${organizationUser.Status}', cannot update Status to 'Invited'`,
      );
    }

    // Retrieve the User's OrganizationAccess metadata to update
    const organizationAccess: OrganizationAccess | undefined = user.OrganizationAccess;
    const laboratoryAccess: LaboratoryAccess | undefined =
      organizationAccess && organizationAccess[request.OrganizationId]
        ? organizationAccess[request.OrganizationId].LaboratoryAccess
        : undefined;

    const response: boolean = await platformUserService.editExistingUserAccessToOrganization(
      {
        ...user,
        OrganizationAccess: {
          ...organizationAccess,
          [request.OrganizationId]: <OrganizationAccessDetails>{
            Status: request.Status,
            OrganizationAdmin: request.OrganizationAdmin,
            LaboratoryAccess: <LaboratoryAccessDetails>{
              ...(laboratoryAccess ? laboratoryAccess : {}),
            },
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
    return {
      statusCode: 400,
      body: JSON.stringify({
        Error: getErrorMessage(err),
      }),
    };
  }
};

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  return err.message;
}
