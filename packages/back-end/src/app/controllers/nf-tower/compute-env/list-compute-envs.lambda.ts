import { GetParameterCommandOutput, ParameterNotFound } from '@aws-sdk/client-ssm';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { ListComputeEnvsResponse } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '../../../services/easy-genomics/laboratory-service';
import { SsmService } from '../../../services/ssm-service';
import { getApiParameters, httpRequest, REST_API_METHOD } from '../../../utils/rest-api-utils';

const laboratoryService = new LaboratoryService();
const ssmService = new SsmService();

/**
 * This GET /nf-tower/compute-env/list-compute-envs?laboratoryId={LaboratoryId}
 * API queries the NextFlow Tower GET /compute-envs?workspaceId={WorkspaceId}
 * API for a list of available Compute Environments, and it expects:
 *  - Required Query Parameter:
 *    - 'laboratoryId': containing the LaboratoryId to retrieve the WorkspaceId & AccessToken
 *  - Optional Query Parameters:
 *    - 'max': pagination number of results
 *    - 'offset': pagination results offset index
 *    - 'search': string to search by the Compute-Env name attribute (e.g. ABC)
 *
 * @param event
 */
export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get required query parameter
    const laboratoryId: string = event.queryStringParameters?.laboratoryId || '';
    if (laboratoryId === '') throw new Error('Required laboratoryId is missing');

    const laboratory: Laboratory = await laboratoryService.queryByLaboratoryId(laboratoryId);
    if (!laboratory.NextFlowTowerWorkspaceId) {
      throw new Error('Laboratory Workspace Id unavailable');
    }

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
    const apiParameters: URLSearchParams = getApiParameters(event);
    apiParameters.set('workspaceId', `${laboratory.NextFlowTowerWorkspaceId}`);

    const response: ListComputeEnvsResponse = await httpRequest<ListComputeEnvsResponse>(
      `${process.env.SEQERA_API_BASE_URL}/compute-envs?${apiParameters.toString()}`,
      REST_API_METHOD.GET,
      { Authorization: `Bearer ${accessToken}` },
    );
    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildResponse(400, JSON.stringify({ Error: getErrorMessage(err) }), event);
  }
};

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  if (err instanceof ParameterNotFound) {
    return 'Laboratory Access Token unavailable';
  } else {
    return err.message;
  }
}
