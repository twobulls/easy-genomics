import { GetParameterCommandOutput } from '@aws-sdk/client-ssm';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { DescribeWorkflowReportsResponse } from '@easy-genomics/shared-lib/src/app/types/nf-tower/workflow-reports';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { SsmService } from '@BE/services/ssm-service';
import { getApiParameters, httpRequest, REST_API_METHOD } from '@BE/utils/rest-api-utils';

const laboratoryService = new LaboratoryService();
const ssmService = new SsmService();

/**
 * This GET /nf-tower/workflow/list-workflow-reports/{:id}?laboratoryId={LaboratoryId}
 * API queries the NextFlow Tower GET /workflow/{:id}/reports?workspaceId={WorkspaceId}
 * API for a fetching Workflow's Reports, and it expects:
 *  - Required Path Parameter:
 *    - 'id': NextFlow Tower Workflow Id
 *  - Required Query Parameter:
 *    - 'laboratoryId': containing the LaboratoryId to retrieve the WorkspaceId & AccessToken
 *
 * @param event
 */
export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get required path parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new Error('Required id is missing');

    // Get required query parameter
    const laboratoryId: string = event.queryStringParameters?.laboratoryId || '';
    if (laboratoryId === '') throw new Error('Required laboratoryId is missing');

    const laboratory: Laboratory = await laboratoryService.queryByLaboratoryId(laboratoryId);

    // Retrieve Seqera Cloud / NextFlow Tower AccessToken from SSM
    const getParameterResponse: GetParameterCommandOutput = await ssmService.getParameter({
      Name: `/easy-genomics/organization/${laboratory.OrganizationId}/laboratory/${laboratory.LaboratoryId}/nf-access-token`,
      WithDecryption: true,
    });
    const accessToken: string | undefined = getParameterResponse.Parameter?.Value;
    if (!accessToken) {
      throw new Error('Laboratory Access Token unavailable');
    }

    // Get Query Parameters for Seqera Cloud / NextFlow Tower APIs
    const apiQueryParameters: string = getApiQueryParameters(event, laboratory.NextFlowTowerWorkspaceId);
    const response: DescribeWorkflowReportsResponse = await httpRequest<DescribeWorkflowReportsResponse>(
      `${process.env.SEQERA_API_BASE_URL}/workflow/${id}/reports?${apiQueryParameters}`,
      REST_API_METHOD.GET,
      { Authorization: `Bearer ${accessToken}` },
    );
    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};

function getApiQueryParameters(event: APIGatewayProxyWithCognitoAuthorizerEvent, workspaceId?: string): string {
  const apiParameters: URLSearchParams = getApiParameters(event);
  if (workspaceId && workspaceId !== '') {
    apiParameters.set('workspaceId', workspaceId);
  }
  return apiParameters.toString();
}
