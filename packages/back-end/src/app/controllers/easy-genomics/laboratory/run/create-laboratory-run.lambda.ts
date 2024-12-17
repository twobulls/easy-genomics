import {
  AddLaboratoryRun,
  AddLaboratoryRunSchema,
} from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory-run';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { LaboratoryRun } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-run';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  InvalidRequestError,
  LaboratoryNotFoundError,
  UnauthorizedAccessError,
} from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryRunService } from '@BE/services/easy-genomics/laboratory-run-service';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import {
  validateLaboratoryManagerAccess,
  validateLaboratoryTechnicianAccess,
  validateOrganizationAdminAccess,
} from '@BE/utils/auth-utils';

const laboratoryRunService = new LaboratoryRunService();
const laboratoryService = new LaboratoryService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const currentUserId = event.requestContext.authorizer.claims['cognito:username'];
    // Post Request Body
    const request: AddLaboratoryRun = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    if (!AddLaboratoryRunSchema.safeParse(request).success) {
      throw new InvalidRequestError();
    }

    // Only available for Org Admins or Laboratory Managers and Technicians
    if (
      !(
        validateOrganizationAdminAccess(event, request.OrganizationId) ||
        validateLaboratoryManagerAccess(event, request.OrganizationId, request.LaboratoryId) ||
        validateLaboratoryTechnicianAccess(event, request.OrganizationId, request.LaboratoryId)
      )
    ) {
      throw new UnauthorizedAccessError();
    }

    // Validate Laboratory exists before creating Laboratory Run
    const laboratory: Laboratory = await laboratoryService.get(request.OrganizationId, request.LaboratoryId);
    if (!laboratory) {
      throw new LaboratoryNotFoundError();
    }

    const response = await laboratoryRunService
      .add(<LaboratoryRun>{
        LaboratoryId: laboratory.LaboratoryId,
        RunId: request.RunId,
        UserId: currentUserId,
        OrganizationId: laboratory.OrganizationId,
        Type: request.Type,
        Status: 'Created',
        Title: request.Title,
        WorkflowName: request.WorkflowName,
        Settings: JSON.stringify(request.Settings),
        CreatedAt: new Date().toISOString(),
        CreatedBy: currentUserId,
      })
      .catch((error: any) => {
        throw error;
      });
    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
