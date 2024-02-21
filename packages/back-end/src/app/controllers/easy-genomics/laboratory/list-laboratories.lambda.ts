import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/persistence/easy-genomics/laboratory';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '../../../services/easy-genomics/laboratory-service';

const laboratoryService = new LaboratoryService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const response: Laboratory[] = await laboratoryService.listLaboratories();

    if (response) {
      return buildResponse(200, JSON.stringify(response), event);
    } else {
      throw new Error(`Unable to find Laboratories: ${JSON.stringify(response)}`);
    }
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 400,
      body: `Error: ${err.message}`,
    };
  }
};
