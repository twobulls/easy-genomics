import { RemoveOrganizationUserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/organization-user';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { OrganizationUserService } from '../../../../services/easy-genomics/organization-user-service';
import { PlatformUserService } from '../../../../services/easy-genomics/platform-user-service';
import { UserService } from '../../../../services/easy-genomics/user-service';

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
    if (!RemoveOrganizationUserSchema.safeParse(request).success) throw new Error('Invalid request');

    // Verify User has access to the Organization - throws error if not found
    const organizationUser: OrganizationUser = await organizationUserService.get(
      request.OrganizationId,
      request.UserId,
    );

    // Retrieve User object for necessary details to perform update/delete transaction
    const user: User = await userService.get(request.UserId);
    const response: boolean = await platformUserService.removeExistingUserFromOrganization(
      {
        ...user,
        ModifiedAt: new Date().toISOString(),
        ModifiedBy: currentUserId,
      },
      organizationUser,
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
