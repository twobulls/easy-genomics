import { RemoveLaboratoryUserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory-user';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
import {
  LaboratoryAccess,
  OrganizationAccessDetails,
  User,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '../../../../services/easy-genomics/laboratory-service';
import { LaboratoryUserService } from '../../../../services/easy-genomics/laboratory-user-service';
import { PlatformUserService } from '../../../../services/easy-genomics/platform-user-service';
import { UserService } from '../../../../services/easy-genomics/user-service';

const laboratoryService = new LaboratoryService();
const laboratoryUserService = new LaboratoryUserService();
const platformUserService = new PlatformUserService();
const userService = new UserService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const currentUserId: string = event.requestContext.authorizer.claims['cognito:username'];
    // Post Request Body
    const request: LaboratoryUser = (
      event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!)
    );
    // Data validation safety check
    if (!RemoveLaboratoryUserSchema.safeParse(request).success) throw new Error('Invalid request');

    // Verify User has access to the Laboratory - throws error if not found
    await laboratoryUserService.get(request.LaboratoryId, request.UserId);

    // Retrieve Laboratory & User objects for necessary details to perform update/delete transaction
    const laboratory: Laboratory = await laboratoryService.queryByLaboratoryId(request.LaboratoryId);
    const user: User = await userService.get(request.UserId);

    // Retrieve the User's OrganizationAccess metadata to remove LaboratoryId
    const laboratoryAccess: LaboratoryAccess | undefined =
      (user.OrganizationAccess && user.OrganizationAccess[laboratory.OrganizationId])
        ? user.OrganizationAccess[laboratory.OrganizationId].LaboratoryAccess
        : undefined;
    (laboratoryAccess) ? delete laboratoryAccess[laboratory.LaboratoryId] : false;

    const response: boolean = await platformUserService.removeExistingUserFromLaboratory({
      ...user,
      OrganizationAccess: {
        ...user.OrganizationAccess,
        [laboratory.OrganizationId]: <OrganizationAccessDetails>{
          Status: 'Active',
          LaboratoryAccess: laboratoryAccess,
        },
      },
      ModifiedAt: new Date().toISOString(),
      ModifiedBy: currentUserId,
    }, request);

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
};
