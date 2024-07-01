import { ListWorkflowsResponse } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '../../services/easy-genomics/laboratory-service';
import { decrypt } from '../../utils/encryption-utils';
import { getApiParameters, httpGet, validateOrganizationAccess } from '../../utils/rest-api-utils';

const laboratoryService = new LaboratoryService();

/**
 * This GET /nf-tower/read-workflows/{LaboratoryId} API queries the /workflow API for
 * a list of NextFlow Tower Workflows, and it expects:
 *  - Required Path Parameter containing the LaboratoryId to retrieve the WorkspaceId & AccessToken
 *  - Optional Query Parameters:
 *    - max: pagination number of results
 *    - offset: pagination results offset index
 *    - search: string to search by the Workflows projectName attribute (e.g. nf-core/viralrecon)
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

    const laboratory = await laboratoryService.queryByLaboratoryId(id);

    if (!validateOrganizationAccess(event, laboratory.OrganizationId, laboratory.LaboratoryId)) {
      throw new Error('Unauthorized');
    }

    if (!laboratory.NextFlowTowerWorkspaceId) {
      throw new Error('Laboratory Workspace Id unavailable');
    }
    if (!laboratory.NextFlowTowerAccessToken) {
      throw new Error('Laboratory Access Token unavailable');
    }
    const accessToken: string | undefined = await decrypt(laboratory.NextFlowTowerAccessToken);

    // Get Query Parameters for Seqera Cloud / NextFlow Tower APIs
    const apiParameters = getApiParameters(event);
    apiParameters.set('workspaceId', `${laboratory.NextFlowTowerWorkspaceId}`);

    const response: ListWorkflowsResponse = await httpGet<ListWorkflowsResponse>(
      `${process.env.SEQERA_API_BASE_URL}/workflow?${apiParameters.toString()}`,
      { Authorization: `Bearer ${accessToken}` },
    );
    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildResponse(400, JSON.stringify({ Error: err.message }), event);
  }
};
