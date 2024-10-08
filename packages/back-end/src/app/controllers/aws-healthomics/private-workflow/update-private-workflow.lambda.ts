import { UpdatePrivateWorkflowSchema } from '@easy-genomics/shared-lib/src/app/schema/aws-healthomics/private-workflow';
import { PrivateWorkflow } from '@easy-genomics/shared-lib/src/app/types/aws-healthomics/private-workflow';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { PrivateWorkflowService } from '@BE/services/aws-healthomics/private-workflow-service';

const privateWorkflowService = new PrivateWorkflowService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Path Parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new Error('Required id is missing');

    const userId = event.requestContext.authorizer.claims['cognito:username'];
    // Put Request Body
    const request: PrivateWorkflow = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    if (!UpdatePrivateWorkflowSchema.safeParse(request).success) throw new Error('Invalid request');

    // Lookup by PrivateWorkflowId to confirm existence before updating
    const existing: PrivateWorkflow = await privateWorkflowService.query(id);
    const updated: PrivateWorkflow = await privateWorkflowService.update({
      ...existing,
      ...request,
      ModifiedAt: new Date().toISOString(),
      ModifiedBy: userId,
    });
    return buildResponse(200, JSON.stringify(updated), event);
  } catch (err: any) {
    console.error(err);
    return buildResponse(400, JSON.stringify({ Error: getErrorMessage(err) }), event);
  }
};

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  return err.message;
}
