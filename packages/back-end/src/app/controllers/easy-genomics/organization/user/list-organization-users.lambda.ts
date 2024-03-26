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
    // Get Query Parameter
    const organizationId: string | undefined = event.queryStringParameters?.organizationId;
    const userId: string | undefined = event.queryStringParameters?.userId;

    const response: OrganizationUser[] = await listOrganizationUsers(organizationId, userId);

    if (response) {
      return buildResponse(200, JSON.stringify(response), event);
    } else {
      throw new Error(`Unable to find Organization Users: ${JSON.stringify(response)}`);
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

const listOrganizationUsers = async (organizationId?: string, userId?: string): Promise<OrganizationUser[]> => {
  if (organizationId && !userId) {
    return organizationUserService.queryByOrganizationId(organizationId);
  } else if (!organizationId && userId) {
    return organizationUserService.queryByUserId(userId);
  } else {
    throw new Error('Specify either organizationId or userId query parameter to retrieve the list of organization-users');
  }
};

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  return err.message;
};
