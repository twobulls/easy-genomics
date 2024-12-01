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
    if (!event.queryStringParameters?.laboratoryId) {
      throw new InvalidRequestError();
    }

    // Check if laboratory exists and use it for permissions check
    const laboratoryId: string = event.queryStringParameters?.laboratoryId;
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

    const results: ReadLaboratoryRun[] = laboratoryRuns.map((laboratoryRun: LaboratoryRun) => {
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
