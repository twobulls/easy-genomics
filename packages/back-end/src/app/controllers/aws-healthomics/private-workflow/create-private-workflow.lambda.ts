import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { CreatePrivateWorkflowSchema } from '@easy-genomics/shared-lib/src/app/schema/aws-healthomics/private-workflow';
import { PrivateWorkflow } from '@easy-genomics/shared-lib/src/app/types/aws-healthomics/private-workflow';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { PrivateWorkflowService } from '@BE/services/aws-healthomics/private-workflow-service';

const privateWorkflowService = new PrivateWorkflowService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const userId = event.requestContext.authorizer.claims['cognito:username'];
    // Post Request Body
    const request: PrivateWorkflow = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    if (!CreatePrivateWorkflowSchema.safeParse(request).success) throw new Error('Invalid request');

    const response: PrivateWorkflow = await privateWorkflowService.add({
      ...request,
      PrivateWorkflowId: uuidv4(),
      Status: 'New',
      CreatedAt: new Date().toISOString(),
      CreatedBy: userId,
    });
    return buildResponse(200, JSON.stringify(response), event);
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
  if (err instanceof ConditionalCheckFailedException) {
    return 'Private Workflow already exists';
  } else {
    return err.message;
  }
}
