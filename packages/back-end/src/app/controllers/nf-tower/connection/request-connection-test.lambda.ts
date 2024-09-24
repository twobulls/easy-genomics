import { RequestNFConnectionTestSchema } from '@easy-genomics/shared-lib/src/app/schema/nf-tower/connection-test';
import { NFConnectionTest } from '@easy-genomics/shared-lib/src/app/types/nf-tower/connection-test';
import { ListComputeEnvsResponse } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { InvalidRequestError } from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { httpRequest, REST_API_METHOD } from '@BE/utils/rest-api-utils';

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Post Request Body
    const request: NFConnectionTest = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);

    // Data validation safety check
    if (!RequestNFConnectionTestSchema.safeParse(request).success) throw new InvalidRequestError();

    // Build Query Parameters for calling NextFlow Tower
    const apiParameters: URLSearchParams = new URLSearchParams();
    apiParameters.set('workspaceId', `${request.WorkspaceId}`);

    const nfResponse: ListComputeEnvsResponse = await httpRequest<ListComputeEnvsResponse>(
      `${process.env.SEQERA_API_BASE_URL}/compute-envs?${apiParameters.toString()}`,
      REST_API_METHOD.GET,
      { Authorization: `Bearer ${request.AccessToken}` },
    );

    if (!nfResponse) {
      throw new Error('Connection test failed');
    }

    return buildResponse(200, JSON.stringify({ Status: 'Success' }), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
