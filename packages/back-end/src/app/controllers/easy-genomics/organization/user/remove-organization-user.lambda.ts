import { RemoveOrganizationUserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/organization-user';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { OrganizationUserService } from '../../../../services/easy-genomics/organization-user-service';

const organizationUserService = new OrganizationUserService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Post Request Body
    const request: OrganizationUser = (
      event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!)
    );
    // Data validation safety check
    if (!RemoveOrganizationUserSchema.safeParse(request).success) throw new Error('Invalid request');

    // Lookup by OrganizationId & UserId to confirm existence before removing
    const existing: OrganizationUser = await organizationUserService.get(request.OrganizationId, request.UserId);
    const isDeleted: boolean = await organizationUserService.delete(existing);
    return buildResponse(200, JSON.stringify({
      deleted: isDeleted,
    }), event);
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
