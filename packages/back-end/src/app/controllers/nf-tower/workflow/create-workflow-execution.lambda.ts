import { GetParameterCommandOutput, ParameterNotFound } from '@aws-sdk/client-ssm';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { SnsProcessingEvent } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/sns-processing-event';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import {
  CreateWorkflowLaunchRequest,
  CreateWorkflowLaunchResponse,
} from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  LaboratoryAccessTokenUnavailableError,
  LaboratoryNotFoundError,
  MissingNextFlowTowerAccessError,
  RequiredIdNotFoundError,
  UnauthorizedAccessError,
} from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { LaboratoryRunService } from '@BE/services/easy-genomics/laboratory-run-service';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { UserService } from '@BE/services/easy-genomics/user-service';
import { SnsService } from '@BE/services/sns-service';
import { SsmService } from '@BE/services/ssm-service';
import {
  validateLaboratoryManagerAccess,
  validateLaboratoryTechnicianAccess,
  validateOrganizationAdminAccess,
} from '@BE/utils/auth-utils';
import { getNextFlowApiQueryParameters, httpRequest, REST_API_METHOD } from '@BE/utils/rest-api-utils';

const userService = new UserService();
const laboratoryService = new LaboratoryService();
const laboratoryRunService = new LaboratoryRunService();
const ssmService = new SsmService();
const snsService = new SnsService();

/**
 * This POST /nf-tower/workflow/create-workflow-execution?laboratoryId={LaboratoryId}
 * API calls the NextFlow Tower POST /workflow/launch?workspaceId={WorkspaceId}
 * API to launch a specific Workflow (aka Pipeline Run), and it expects:
 *  - Required Query Parameter:
 *    - 'laboratoryId': containing the LaboratoryId to retrieve the WorkspaceId & AccessToken
 *  - Required Body JSON Payload:
 *    - this must match the CreateWorkflowLaunchRequest type definition and can
 *      be obtained for each respective Pipeline by calling the
 *      GET /nf-tower/pipeline/read-pipeline-launch-details/{Pipeline Id} API
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

    // Laboratory requires access to NextFlow Tower
    if (!laboratory.NextFlowTowerEnabled) {
      throw new MissingNextFlowTowerAccessError();
    }

    // Fetch the user
    const userEmail = event.requestContext.authorizer.claims.email;
    const user: User | undefined = (await userService.queryByEmail(userEmail)).shift();

    console.log('event.isBase64Encoded:', event.isBase64Encoded);

    const rawBody = event.isBase64Encoded ? atob(event.body!) : event.body!;
    console.log('rawBody:', rawBody);

    const createWorkflowLaunchRequest: CreateWorkflowLaunchRequest = JSON.parse(rawBody);
    console.log('createWorkflowLaunchRequest:', createWorkflowLaunchRequest);

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

    console.log('Next Flow Tower API create workflow launch API Parameters:', apiQueryParameters);
    console.log('Next Flow Tower API create workflow launch request:', createWorkflowLaunchRequest);

    const nfTowerResponse: CreateWorkflowLaunchResponse = await httpRequest<CreateWorkflowLaunchResponse>(
      `${process.env.SEQERA_API_BASE_URL}/workflow/launch?${apiQueryParameters}`,
      REST_API_METHOD.POST,
      { Authorization: `Bearer ${accessToken}` },
      createWorkflowLaunchRequest, // Delegate request body validation to Seqera Cloud / NextFlow Tower
    );
    console.log('Create workflow launch response from Next Flow Tower API:', nfTowerResponse);

    // Create laboratory run
    const runId: string = crypto.randomUUID().toLowerCase();

    const response = await laboratoryRunService
      .add({
        LaboratoryId: laboratory.LaboratoryId,
        RunId: runId,
        OrganizationId: laboratory.OrganizationId,
        WorkflowName: nfTowerResponse.workflowId,
        Status: 'PENDING',
        UserId: user?.UserId || 'unknown',
        Type: 'Seqera Cloud',
        Settings: '{}',
        CreatedAt: Date.now().toString(),
        CreatedBy: user?.UserId || 'unknown',
        ExternalRunId: nfTowerResponse.workflowId,
      })
      .catch((error: any) => {
        throw error;
      });
    console.log('created lab run', response);

    // Queue up run status checks
    const record: SnsProcessingEvent = {
      Operation: 'UPDATE',
      Type: 'LaboratoryRun',
      Record: response,
    };
    await snsService.publish({
      TopicArn: process.env.SNS_NF_TOWER_RUN_STATUS_CHECK_TOPIC,
      Message: JSON.stringify(record),
      MessageGroupId: `update-laboratory-run-${response.RunId}`,
      MessageDeduplicationId: uuidv4(),
    });

    return buildResponse(200, JSON.stringify(nfTowerResponse), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
