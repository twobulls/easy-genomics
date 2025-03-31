import {
  UpdateLaboratoryPipelines,
  UpdateLaboratoryPipelinesSchema,
} from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory-pipeline';
import {
  AwsHealthOmicsWorkflows,
  Laboratory,
  NextFlowTowerPipelines,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  InvalidRequestError,
  RequiredIdNotFoundError,
  UnauthorizedAccessError,
} from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryPipelineService } from '@BE/services/easy-genomics/laboratory-pipeline-service';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { validateOrganizationAdminAccess } from '@BE/utils/auth-utils';

const laboratoryService = new LaboratoryService();
const laboratoryPipelineService = new LaboratoryPipelineService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Path Parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new RequiredIdNotFoundError();

    const userId: string = event.requestContext.authorizer.claims['cognito:username'];
    // Put Request Body
    const request: UpdateLaboratoryPipelines = event.isBase64Encoded
      ? JSON.parse(atob(event.body!))
      : JSON.parse(event.body!);
    // Data validation safety check
    if (!UpdateLaboratoryPipelinesSchema.safeParse(request).success) {
      throw new InvalidRequestError();
    }

    // Lookup by LaboratoryId to confirm existence before updating
    const existing: Laboratory = await laboratoryService.queryByLaboratoryId(id);

    // Only Organisation Admins are allowed to edit laboratories
    if (!validateOrganizationAdminAccess(event, existing.OrganizationId)) {
      throw new UnauthorizedAccessError();
    }

    const response: Laboratory | void = await laboratoryPipelineService
      .updateLaboratoryPipelines({
        ...existing,
        AwsHealthOmicsWorkflows: <AwsHealthOmicsWorkflows>request.AwsHealthOmicsWorkflows,
        NextFlowTowerPipelines: <NextFlowTowerPipelines>request.NextFlowTowerPipelines,
        ModifiedAt: new Date().toISOString(),
        ModifiedBy: userId,
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
