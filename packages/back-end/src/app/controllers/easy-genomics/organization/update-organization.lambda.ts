import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/persistence/easy-genomics/organization';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { OrganizationService } from '../../../services/easy-genomics/organization-service';

const organizationService = new OrganizationService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Path Parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new Error('Required id is missing');

    // Put Request Body
    const request: Organization = (
      event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!)
    );
    const userId = event.requestContext.authorizer.claims['cognito:username'];

    // Lookup by OrganizationId to confirm existence before updating
    const existing: Organization = await organizationService.get(id);
    const updated: Organization = await organizationService.update({
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
    return 'Organization Name already taken';
  } else {
    return err.message;
  }
};
