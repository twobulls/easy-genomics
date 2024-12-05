import { ListRunsCommandInput, RunStatus } from '@aws-sdk/client-omics';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/lib/app/utils/common';
import {
  LaboratoryNotFoundError,
  RequiredIdNotFoundError,
  UnauthorizedAccessError,
} from '@easy-genomics/shared-lib/lib/app/utils/HttpError';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { MissingAWSHealthOmicsAccessError } from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { OmicsService } from '@BE/services/omics-service';
import {
  validateLaboratoryManagerAccess,
  validateLaboratoryTechnicianAccess,
  validateOrganizationAdminAccess,
} from '@BE/utils/auth-utils';
import { AwsHealthOmicsQueryParameters, getAwsHealthOmicsApiQueryParameters } from '@BE/utils/rest-api-utils';

const laboratoryService = new LaboratoryService();
const omicsService = new OmicsService();

/**
 * This GET /aws-healthomics/run/list-runs?laboratoryId={LaboratoryId}
 * API queries the same region's AWS HealthOmics service to retrieve a list of
 * Runs, and it expects:
 *  - Required Query Parameter:
 *    - 'laboratoryId': to retrieve the Laboratory to verify access to AWS HealthOmics
 *  - Optional Query Parameters:
 *    - 'maxResults': pagination number of results
 *    - 'nextToken': pagination results offset index
 *    - 'name': string to search by the Workflow name attribute
 *    - 'status': string to search by Status of Workflow Run
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

    // Requires AWS Health Omics access
    if (!laboratory.AwsHealthOmicsEnabled) {
      throw new MissingAWSHealthOmicsAccessError();
    }

    const queryParameters: AwsHealthOmicsQueryParameters = getAwsHealthOmicsApiQueryParameters(event);
    const response = await omicsService.listRuns(<ListRunsCommandInput>{
      ...queryParameters,
      status: validateRunStatusQueryParameter(queryParameters.status),
    });
    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};

/**
 * Helper function to validate status query parameter and return the corresponding RunStatus filter.
 */
function validateRunStatusQueryParameter(status: string | undefined): RunStatus | undefined {
  if (!status) {
    return undefined;
  }

  switch (status.toUpperCase()) {
    case 'CANCELLED':
      return RunStatus.CANCELLED;
    case 'COMPLETED':
      return RunStatus.COMPLETED;
    case 'DELETED':
      return RunStatus.DELETED;
    case 'FAILED':
      return RunStatus.FAILED;
    case 'PENDING':
      return RunStatus.PENDING;
    case 'RUNNING':
      return RunStatus.RUNNING;
    case 'STARTING':
      return RunStatus.STARTING;
    case 'STOPPING':
      return RunStatus.STOPPING;
    default:
      return undefined;
  }
}
