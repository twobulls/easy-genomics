import { RequestPrivateWorkflowSchema } from '@easy-genomics/shared-lib/src/app/schema/aws-healthomics/private-workflow';
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
    // Post Request Body
    const request: PrivateWorkflow = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    if (!RequestPrivateWorkflowSchema.safeParse(request).success) throw new Error('Invalid request');

    const response: PrivateWorkflow = await privateWorkflowService.get(request.Url, request.Version);
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
