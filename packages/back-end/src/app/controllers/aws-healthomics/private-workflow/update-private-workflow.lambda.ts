import { PrivateWorkflow } from '@easy-genomics/shared-lib/src/app/types/persistence/aws-healthomics/private-workflow';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { PrivateWorkflowService } from '../../../services/aws-healthomics/private-workflow-service';

const privateWorkflowService = new PrivateWorkflowService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Path Parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new Error('Required id is missing');

    // Put Request Body
    const request: PrivateWorkflow = (
      event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!)
    );
    const userId = event.requestContext.authorizer.claims['cognito:username'];

    // Lookup by GSI Id for convenience to confirm existence before update
    const existing: PrivateWorkflow = await privateWorkflowService.query(id);
    const updated: PrivateWorkflow = await privateWorkflowService.update(
      {
        ...request,
        Url: existing.Url,
        Version: existing.Version,
        ModifiedAt: new Date().toISOString(),
        ModifiedBy: userId,
      },
    );
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
  return err.message;
};
