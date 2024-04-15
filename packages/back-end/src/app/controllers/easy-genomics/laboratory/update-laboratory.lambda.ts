import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { UpdateLaboratorySchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '../../../services/easy-genomics/laboratory-service';

const laboratoryService = new LaboratoryService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Path Parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new Error('Required id is missing');

    const userId: string = event.requestContext.authorizer.claims['cognito:username'];
    // Put Request Body
    const request: Laboratory = (
      event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!)
    );
    // Data validation safety check
    if (!UpdateLaboratorySchema.safeParse(request).success) throw new Error('Invalid request');

    // Lookup by LaboratoryId to confirm existence before updating
    const existing: Laboratory = await laboratoryService.queryByLaboratoryId(id);
    const updated: Laboratory = await laboratoryService.update({
      ...existing,
      ...request,
      ModifiedAt: new Date().toISOString(),
      ModifiedBy: userId,
    }, existing);
    return buildResponse(200, JSON.stringify(updated), event);
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
  if (err instanceof TransactionCanceledException) {
    return 'Laboratory Name already taken';
  } else {
    return err.message;
  }
};
