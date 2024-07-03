import { GetParameterCommandOutput, ParameterNotFound } from '@aws-sdk/client-ssm';
import { DescribePipelinesResponse } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '../../../services/easy-genomics/laboratory-service';
import { SsmService } from '../../../services/ssm-service';
import { httpGet, validateOrganizationAccess } from '../../../utils/rest-api-utils';

const laboratoryService = new LaboratoryService();
const ssmService = new SsmService();

/**
 * This GET /nf-tower/pipeline/read-pipeline/{:id}?laboratoryId={LaboratoryId}
 * API queries the NextFlow Tower /pipeline/{:id}?workspaceId={WorkspaceId} API
 * for a specific Pipeline's details, and it expects:
 *  - Required Path Parameter:
 *    - 'id': NextFlow Tower Pipeline Id
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
    // Get Path Parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new Error('Required id is missing');

    // Get required query parameter
    const laboratoryId: string = event.queryStringParameters?.laboratoryId || '';
    if (laboratoryId === '') throw new Error('Required laboratoryId is missing');

    const laboratory = await laboratoryService.queryByLaboratoryId(laboratoryId);
    if (!validateOrganizationAccess(event, laboratory.OrganizationId, laboratory.LaboratoryId)) {
      throw new Error('Unauthorized');
    }
    if (!laboratory.NextFlowTowerWorkspaceId) {
      throw new Error('Laboratory Workspace Id unavailable');
    }

    // Retrieve Seqera Cloud / NextFlow Tower AccessToken from SSM
    const accessToken: string | undefined = await ssmService
      .getParameter({
        Name: `/easy-genomics/organization/${laboratory.OrganizationId}/laboratory/${laboratory.LaboratoryId}/nf-access-token`,
        WithDecryption: true,
      })
      .then(async (value: GetParameterCommandOutput) => {
        return value.Parameter?.Value;
      });
    if (!accessToken) {
      throw new Error('Laboratory Access Token unavailable');
    }

    // Get Query Parameters for Seqera Cloud / NextFlow Tower APIs
    const apiParameters: URLSearchParams = new URLSearchParams();
    apiParameters.set('workspaceId', `${laboratory.NextFlowTowerWorkspaceId}`);

    const response: DescribePipelinesResponse = await httpGet<DescribePipelinesResponse>(
      `${process.env.SEQERA_API_BASE_URL}/pipelines/${id}?${apiParameters.toString()}`,
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
