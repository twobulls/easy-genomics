import { GetParameterCommandOutput } from '@aws-sdk/client-ssm';
import { NextFlowConnectionTestRequestSchema } from '@easy-genomics/shared-lib/src/app/schema/nf-tower/nextflow-connection-test-request';
import {
  NextFlowConnectionTestRequest,
  NextFlowConnectionTestResponse,
} from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-connection-test-request';
import { ListComputeEnvsResponse } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { InvalidRequestError } from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { SsmService } from '@BE/services/ssm-service';
import { httpRequest, REST_API_METHOD } from '@BE/utils/rest-api-utils';

const ssmService = new SsmService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Post Request Body
    const request: NextFlowConnectionTestRequest = event.isBase64Encoded
      ? JSON.parse(atob(event.body!))
      : JSON.parse(event.body!);

    // Data validation safety check
    if (!NextFlowConnectionTestRequestSchema.safeParse(request).success) throw new InvalidRequestError();

    const workspaceId: string = request.WorkspaceId;
    let accessToken: string | undefined = request.AccessToken;

    if (!accessToken || accessToken === '') {
      const getNextFlowAccessToken: GetParameterCommandOutput = await ssmService.getParameter({
        Name: `/easy-genomics/organization/${request.OrganizationId}/laboratory/${request.LaboratoryId}/nf-access-token`,
        WithDecryption: true,
      });
      if (!getNextFlowAccessToken.Parameter || !getNextFlowAccessToken.Parameter.Value) {
        throw new Error('Unable to retrieve NextFlow Tower Access Token');
      }
      accessToken = getNextFlowAccessToken.Parameter.Value;
    }

    // Build Query Parameters for calling NextFlow Tower
    const apiParameters: URLSearchParams = new URLSearchParams();
    apiParameters.set('workspaceId', `${workspaceId}`);

    const nfResponse: ListComputeEnvsResponse = await httpRequest<ListComputeEnvsResponse>(
      `${process.env.SEQERA_API_BASE_URL}/compute-envs?${apiParameters.toString()}`,
      REST_API_METHOD.GET,
      { Authorization: `Bearer ${accessToken}` },
    );

    if (!nfResponse) {
      throw new Error('Connection test failed');
    }

    const response: NextFlowConnectionTestResponse = { Status: 'Success' };
    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
