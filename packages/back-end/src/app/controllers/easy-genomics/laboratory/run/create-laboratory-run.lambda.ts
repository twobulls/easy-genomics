import {
  AddLaboratoryRun,
  AddLaboratoryRunSchema,
} from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory-run';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { LaboratoryRun } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-run';
import { SnsProcessingEvent } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/sns-processing-event';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  InvalidRequestError,
  LaboratoryNotFoundError,
  UnauthorizedAccessError,
} from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { LaboratoryRunService } from '@BE/services/easy-genomics/laboratory-run-service';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { SnsService } from '@BE/services/sns-service';
import {
  validateLaboratoryManagerAccess,
  validateLaboratoryTechnicianAccess,
  validateOrganizationAdminAccess,
} from '@BE/utils/auth-utils';

const laboratoryRunService = new LaboratoryRunService();
const laboratoryService = new LaboratoryService();
const snsService = new SnsService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const currentUserId = event.requestContext.authorizer.claims['cognito:username'];
    const currentUserEmail = event.requestContext.authorizer.claims.email;
    // Post Request Body
    const request: AddLaboratoryRun = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    if (!AddLaboratoryRunSchema.safeParse(request).success) {
      throw new InvalidRequestError();
    }

    // Validate Laboratory exists before creating Laboratory Run
    const laboratory: Laboratory = await laboratoryService.queryByLaboratoryId(request.LaboratoryId);
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

    const laboratoryRun: LaboratoryRun = await laboratoryRunService
      .add(<LaboratoryRun>{
        LaboratoryId: laboratory.LaboratoryId,
        RunId: request.RunId,
        UserId: currentUserId,
        OrganizationId: laboratory.OrganizationId,
        RunName: request.RunName,
        Platform: request.Platform,
        Status: request.Status,
        Owner: currentUserEmail,
        WorkflowName: request.WorkflowName,
        ExternalRunId: request.ExternalRunId,
        InputS3Url: request.InputS3Url,
        OutputS3Url: request.OutputS3Url,
        SampleSheetS3Url: request.SampleSheetS3Url,
        Settings: JSON.stringify(request.Settings || {}),
        CreatedAt: new Date().toISOString(),
        CreatedBy: currentUserId,
      })
      .catch((error: any) => {
        throw error;
      });

    if (laboratoryRun.ExternalRunId) {
      // Queue up run status checks
      const record: SnsProcessingEvent = {
        Operation: 'UPDATE',
        Type: 'LaboratoryRun',
        Record: laboratoryRun,
      };
      await snsService.publish({
        TopicArn: process.env.SNS_LABORATORY_RUN_UPDATE_TOPIC,
        Message: JSON.stringify(record),
        MessageGroupId: `update-laboratory-run-${laboratoryRun.RunId}`,
        MessageDeduplicationId: uuidv4(),
      });
    }

    return buildResponse(200, JSON.stringify(laboratoryRun), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
