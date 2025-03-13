import {
  InvalidRequestError,
  LaboratoryNotFoundError,
  UnauthorizedAccessError,
} from '@easy-genomics/shared-lib/lib/app/utils/HttpError';
import { ReadLaboratoryRun } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory-run';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { LaboratoryRun } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-run';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryRunService } from '@BE/services/easy-genomics/laboratory-run-service';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import {
  validateLaboratoryManagerAccess,
  validateLaboratoryTechnicianAccess,
  validateOrganizationAdminAccess,
} from '@BE/utils/auth-utils';

const laboratoryService = new LaboratoryService();
const laboratoryRunService = new LaboratoryRunService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Query Parameter
    const laboratoryId: string | undefined = event.queryStringParameters?.laboratoryId;

    // Check if laboratory exists and use it for permissions check
    if (!laboratoryId) {
      throw new InvalidRequestError();
    }

    // Get Optional Parameters
    const filterKey: string | undefined = event.queryStringParameters?.filterBy;
    const filterVal: string | undefined = event.queryStringParameters?.filter;
    const sortKey: string | undefined = event.queryStringParameters?.sortBy;
    const sortOrder: string | undefined = event.queryStringParameters?.sortOrder;

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

    const laboratoryRuns: LaboratoryRun[] = await laboratoryRunService.queryByLaboratoryId(laboratoryId);
    const laboratoryRunsFiltered: LaboratoryRun[] = filterResults(laboratoryRuns, filterKey, filterVal);
    const laboratoryRunsSorted: LaboratoryRun[] = sortResults(laboratoryRunsFiltered, sortKey, sortOrder);
    const results: ReadLaboratoryRun[] = laboratoryRunsSorted.map((laboratoryRun: LaboratoryRun) => {
      const readLaboratoryRun: ReadLaboratoryRun = {
        ...laboratoryRun,
        Settings: JSON.parse(laboratoryRun.Settings || '{}'),
      };
      return readLaboratoryRun;
    });

    if (results) {
      return buildResponse(200, JSON.stringify(results), event);
    } else {
      throw new Error(`Unable to find Laboratory Runs: ${JSON.stringify(results)}`);
    }
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};

/**
 * Helper function to filter laboratory run results by the specified object property's name & value
 * @param laboratoryRuns
 * @param filterKey
 * @param filterVal
 */
function filterResults(laboratoryRuns: LaboratoryRun[], filterKey?: string, filterVal?: string): LaboratoryRun[] {
  return filterKey && filterVal ? laboratoryRuns.filter((_) => _[filterKey] === filterVal) : laboratoryRuns;
}

/**
 * Helper function to sort laboratory run results by the specified object property's value.
 * @param laboratoryRuns
 * @param sortKey
 * @param sortOrder
 */
function sortResults(laboratoryRuns: LaboratoryRun[], sortKey?: string, sortOrder?: string): LaboratoryRun[] {
  const sorted: LaboratoryRun[] = sortKey
    ? laboratoryRuns.sort((a: LaboratoryRun, b: LaboratoryRun) => a[sortKey].localeCompare(b[sortKey]))
    : laboratoryRuns;
  return sortKey && sortOrder?.toLowerCase() === 'desc' ? sorted.reverse() : sorted;
}
