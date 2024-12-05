import { GetParameterCommandOutput, ParameterNotFound } from '@aws-sdk/client-ssm';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { WorkflowProgressResponse } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  LaboratoryAccessTokenUnavailableError,
  LaboratoryNotFoundError,
  MissingNextFlowTowerAccessError,
  RequiredIdNotFoundError,
  UnauthorizedAccessError,
} from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { SsmService } from '@BE/services/ssm-service';
import {
  validateLaboratoryManagerAccess,
  validateLaboratoryTechnicianAccess,
  validateOrganizationAdminAccess,
} from '@BE/utils/auth-utils';
import { getNextFlowApiQueryParameters, httpRequest, REST_API_METHOD } from '@BE/utils/rest-api-utils';

const laboratoryService = new LaboratoryService();
const ssmService = new SsmService();

/**
 * This GET /nf-tower/workflow/read-workflow-progress/{:id}?laboratoryId={LaboratoryId}
 * API queries the NextFlow Tower GET /workflow/{:id}/progress?workspaceId={WorkspaceId}
 * API for a specific Workflow's Progress details, and it expects:
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
    if (id === '') throw new RequiredIdNotFoundError();

    // Get required query parameter
    const laboratoryId: string = event.queryStringParameters?.laboratoryId || '';
    if (laboratoryId === '') throw new RequiredIdNotFoundError('laboratoryId');

    const laboratory: Laboratory = await laboratoryService.queryByLaboratoryId(laboratoryId);

    if (!laboratory) {
      throw new LaboratoryNotFoundError();
    }

    // Only available for Org Admins or Laboratory Managers and Technicians
    if (
      !(
        validateOrganizationAdminAccess(event, laboratory.OrganizationId) ||
        validateLaboratoryManagerAccess(event, laboratory.OrganizationId, laboratory.LaboratoryId) ||
        validateLaboratoryTechnicianAccess(event, laboratory.OrganizationId, laboratory.LaboratoryId)
      )
    ) {
      throw new UnauthorizedAccessError();
    }

    // Laboratory requires access to NextFlow Tower
    if (!laboratory.NextFlowTowerEnabled) {
      throw new MissingNextFlowTowerAccessError();
    }

    // Retrieve Seqera Cloud / NextFlow Tower AccessToken from SSM
    const getParameterResponse: GetParameterCommandOutput = await ssmService
      .getParameter({
        Name: `/easy-genomics/organization/${laboratory.OrganizationId}/laboratory/${laboratory.LaboratoryId}/nf-access-token`,
        WithDecryption: true,
      })
      .catch((error: any) => {
        if (error instanceof ParameterNotFound) {
          throw new LaboratoryAccessTokenUnavailableError();
        } else {
          throw error;
        }
      });

    const accessToken: string | undefined = getParameterResponse.Parameter?.Value;
    if (!accessToken) {
      throw new LaboratoryAccessTokenUnavailableError();
    }

    // Get Query Parameters for Seqera Cloud / NextFlow Tower APIs
    const apiQueryParameters: string = getNextFlowApiQueryParameters(event, laboratory.NextFlowTowerWorkspaceId);
    const response: WorkflowProgressResponse = await httpRequest<WorkflowProgressResponse>(
      `${process.env.SEQERA_API_BASE_URL}/workflow/${id}/progress?${apiQueryParameters}`,
      REST_API_METHOD.GET,
      { Authorization: `Bearer ${accessToken}` },
    );
    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
