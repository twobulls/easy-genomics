import {
  EditLaboratoryRun,
  EditLaboratoryRunSchema,
} from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory-run';
import { LaboratoryRun } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-run';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  InvalidRequestError,
  LaboratoryRunNotFoundError,
  RequiredIdNotFoundError,
  UnauthorizedAccessError,
} from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryRunService } from '@BE/services/easy-genomics/laboratory-run-service';
import {
  validateLaboratoryManagerAccess,
  validateLaboratoryTechnicianAccess,
  validateOrganizationAdminAccess,
} from '@BE/utils/auth-utils';

const laboratoryRunService = new LaboratoryRunService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Path Parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new RequiredIdNotFoundError();

    const currentUserId = event.requestContext.authorizer.claims['cognito:username'];

    // Put Request Body
    const request: EditLaboratoryRun = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);

    // Data validation safety check
    if (!EditLaboratoryRunSchema.safeParse(request).success) {
      throw new InvalidRequestError();
    }

    // Lookup by RunId to confirm existence before updating
    const existing: LaboratoryRun = await laboratoryRunService.queryByRunId(id);

    if (!existing) {
      throw new LaboratoryRunNotFoundError(id);
    }

    // Only available for Org Admins or Laboratory Managers and Technicians
    if (
      !(
        validateOrganizationAdminAccess(event, existing.OrganizationId) ||
        validateLaboratoryManagerAccess(event, existing.OrganizationId, existing.LaboratoryId) ||
        validateLaboratoryTechnicianAccess(event, existing.OrganizationId, existing.LaboratoryId)
      )
    ) {
      throw new UnauthorizedAccessError();
    }

    const settings: string | undefined = request.Settings ? JSON.stringify(request.Settings) : existing.Settings;

    const response: LaboratoryRun = await laboratoryRunService.update({
      ...existing,
      ...request,
      Settings: settings,
      ModifiedAt: new Date().toISOString(),
      ModifiedBy: currentUserId,
    });

    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
