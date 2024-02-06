import { Organization } from '@easy-genomics/shared-lib/src/app/types/persistence/organization';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { OrganizationService } from '../../../services/easy-genomics/organization-service';

const organizationService = new OrganizationService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const response: Organization[] = await organizationService.listOrganizations();

    if (response) {
      return buildResponse(200, JSON.stringify(response), event);
    } else {
      throw new Error(`Unable to find Organizations: ${JSON.stringify(response)}`);
    }
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 400,
      body: `Error: ${err.message}`,
    };
  }
};
