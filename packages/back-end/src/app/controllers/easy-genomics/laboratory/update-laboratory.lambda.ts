import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
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
    // Get Path Parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new Error('Required id is missing');

    // Put Request Body
    const request: Laboratory = (
      event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!)
    );
    if (!request.Name || request.Name === '') throw new Error('Required Name is missing');
    if (!request.Status || request.Status === '') throw new Error('Required Status is missing');
    if (request.AwsHealthOmicsEnabled === undefined) throw new Error('Required AwsHealthOmicsEnabled is missing');
    if (request.NextFlowTowerEnabled === undefined) throw new Error('Required NextFlowTowerEnabled is missing');
    const userId = event.requestContext.authorizer.claims['cognito:username'];

    // Lookup by LaboratoryId to confirm existence before updating
    const existing: Laboratory = await laboratoryService.query(id);
    const updated: Laboratory = await laboratoryService.update({
      ...existing,
      ...request,
      OrganizationId: existing.OrganizationId,
      LaboratoryId: existing.LaboratoryId,
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
