import { RequestLaboratorySchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';

const laboratoryService = new LaboratoryService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Post Request Body
    const request: Laboratory = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    if (!RequestLaboratorySchema.safeParse(request).success) throw new Error('Invalid request');

    const response: Laboratory = await laboratoryService.get(request.OrganizationId, request.LaboratoryId);
    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildResponse(400, JSON.stringify({ Error: getErrorMessage(err) }), event);
  }
};

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  return err.message;
}
