import { StartRunCommandInput } from '@aws-sdk/client-omics';
import { CreateRunRequestSchema } from '@easy-genomics/shared-lib/lib/app/schema/aws-healthomics/aws-healthomics-api';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/lib/app/utils/common';
import {
  InvalidRequestError,
  LaboratoryNotFoundError,
  RequiredIdNotFoundError,
  UnauthorizedAccessError,
} from '@easy-genomics/shared-lib/lib/app/utils/HttpError';
import { CreateRunRequest } from '@easy-genomics/shared-lib/src/app/types/aws-healthomics/aws-healthomics-api';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { OmicsService } from '@BE/services/omics-service';
import {
  validateLaboratoryManagerAccess,
  validateLaboratoryTechnicianAccess,
  validateOrganizationAdminAccess,
} from '@BE/utils/auth-utils';

const laboratoryService = new LaboratoryService();
const omicsService = new OmicsService();

/**
 * This POST /aws-healthomics/run/create-run-execution?laboratoryId={LaboratoryId}
 * API issues the command to the same region's AWS HealthOmics service to create
 * a new Workflow Run, and it expects:
 *  - Required Query Parameter:
 *    - 'laboratoryId': to retrieve the Laboratory to verify access to AWS HealthOmics
 *  - JSON payload defining the input parameters for starting a Workflow Run
 *    - workflowId
 *    - requestId (transactionId)
 *    - name
 *    - parameters (JSON document defining the inputs for the Workflow including the sample-sheet)
 *
 * @param event
 */
export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Post Request Body
    const request: CreateRunRequest = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    if (!CreateRunRequestSchema.safeParse(request).success) throw new InvalidRequestError();

    // Get required query parameter
    const laboratoryId: string = event.queryStringParameters?.laboratoryId || '';
    if (laboratoryId === '') throw new RequiredIdNotFoundError('laboratoryId');

    const laboratory: Laboratory = await laboratoryService.queryByLaboratoryId(laboratoryId);

    if (!laboratory) {
      throw new LaboratoryNotFoundError();
    }

    if (!laboratory.AwsHealthOmicsEnabled) {
      throw new UnauthorizedAccessError('Laboratory does not have AWS HealthOmics enabled');
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

    const parameters = JSON.parse(request.parameters.toString());
    const response = await omicsService.startRun(<StartRunCommandInput>{
      ...request,
      parameters: {
        ...parameters,
        outdir: '/mnt/workflow/pubdir', // AWS HealthOmics requires explicitly setting 'outdir' = '/mnt/workflow/pubdir' for internal output
      },
      outputUri: parameters.outdir, // AWS HealthOmics requires setting outputUri for copying 'outdir' output to the final destination
      workflowType: 'PRIVATE',
      roleArn: `arn:aws:iam::${process.env.ACCOUNT_ID}:role/${process.env.NAME_PREFIX}-easy-genomics-healthomics-workflow-run-role`,
    });
    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
