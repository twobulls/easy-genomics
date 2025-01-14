import { GetRunCommandInput } from '@aws-sdk/client-omics';
import { GetParameterCommandOutput, ParameterNotFound } from '@aws-sdk/client-ssm';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { LaboratoryRun } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-run';
import {
  SnsProcessingEvent,
  SnsProcessingOperation,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/sns-processing-event';
import { DescribeWorkflowResponse } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { LaboratoryAccessTokenUnavailableError } from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, Handler, SQSRecord } from 'aws-lambda';
import { SQSEvent } from 'aws-lambda/trigger/sqs';
//import { v4 as uuidv4 } from 'uuid';
import { LaboratoryRunService } from '@BE/services/easy-genomics/laboratory-run-service';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { OmicsService } from '@BE/services/omics-service';
import { SnsService } from '@BE/services/sns-service';
import { SsmService } from '@BE/services/ssm-service';
import { getNextFlowApiQueryParameters, httpRequest, REST_API_METHOD } from '@BE/utils/rest-api-utils';

const laboratoryService = new LaboratoryService();
const laboratoryRunService = new LaboratoryRunService();
const ssmService = new SsmService();
const snsService = new SnsService();
const omicsService = new OmicsService();

export const handler: Handler = async (event: SQSEvent): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const sqsRecords: SQSRecord[] = event.Records;
    for (const sqsRecord of sqsRecords) {
      const body = JSON.parse(sqsRecord.body);
      const snsEvent: SnsProcessingEvent = <SnsProcessingEvent>JSON.parse(body.Message);

      switch (snsEvent.Type) {
        case 'LaboratoryRun':
          const laboratoryRun: LaboratoryRun = <LaboratoryRun>JSON.parse(JSON.stringify(snsEvent.Record));
          await processStatusCheckEvent(snsEvent.Operation, laboratoryRun);
          break;
        default:
          console.error(`Unsupported SNS Processing Event Type: ${snsEvent.Type}`);
      }
    }

    return buildResponse(200, JSON.stringify({ Status: 'Success' }));
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err);
  }
};

async function processStatusCheckEvent(operation: SnsProcessingOperation, laboratoryRun: LaboratoryRun) {
  if (operation === 'UPDATE') {
    try {
      console.log('Processing LaboratoryRun Status Update: ', laboratoryRun);
      const existingRun: LaboratoryRun = await laboratoryRunService.queryByRunId(laboratoryRun.RunId);

      if (!existingRun.ExternalRunId) {
        console.log('Missing ExternalRunID from laboratory run: skipping');
        return false;
      }

      let currentStatus = existingRun.Status;

      if (existingRun.Platform === 'AWS HealthOmics') {
        currentStatus = await getAWSHealthOmicsStatus(existingRun);
      } else if (existingRun.Platform === 'Seqera Cloud') {
        currentStatus = await getSeqeraCloudStatus(existingRun);
      }

      // Has status changed?
      if (existingRun.Status.toUpperCase() != currentStatus.toUpperCase()) {
        console.log('status change', existingRun.Status, currentStatus);

        laboratoryRun = await laboratoryRunService.update({
          ...existingRun,
          Status: currentStatus.toUpperCase(),
          ModifiedAt: new Date().toISOString(),
          ModifiedBy: 'Status Check',
        });
      }

      // Do we need to queue up another check?
      // NOTE: we don't have unified Easy Genomics statuses yet, so the list of status here
      //       is a mix of both Seqera and Omics
      if (['FAILED', 'SUCCEEDED', 'CANCELLED', 'COMPLETED', 'DELETED'].includes(currentStatus)) {
        console.log('run finished with status:', currentStatus);
      } else {
        console.log('Queueing another status check:', currentStatus);
        const record: SnsProcessingEvent = {
          Operation: 'UPDATE',
          Type: 'LaboratoryRun',
          Record: laboratoryRun,
        };
        await snsService.publish({
          TopicArn: process.env.SNS_LABORATORY_RUN_UPDATE_TOPIC,
          Message: JSON.stringify(record),
          MessageGroupId: `update-laboratory-run-${laboratoryRun.RunId}`,
          MessageDeduplicationId: laboratoryRun.RunId, //uuidv4(),
        });
      }
    } catch (err: any) {
      console.error(err);

      //TODO: should have something to prevent endless loops
      console.log('Queueing another status check due to error checking status');
      const record: SnsProcessingEvent = {
        Operation: 'UPDATE',
        Type: 'LaboratoryRun',
        Record: laboratoryRun,
      };
      await snsService.publish({
        TopicArn: process.env.SNS_LABORATORY_RUN_UPDATE_TOPIC,
        Message: JSON.stringify(record),
        MessageGroupId: `update-laboratory-run-${laboratoryRun.RunId}`,
        MessageDeduplicationId: laboratoryRun.RunId, //uuidv4(),
      });
    }
  } else {
    console.error(`Unsupported SNS Processing Event Operation: ${operation}`);
  }
  return true;
}

async function getAWSHealthOmicsStatus(laboratoryRun: LaboratoryRun): Promise<string> {
  console.log('Fetching AWS Health Omics status for run: ', laboratoryRun.RunId);

  const response = await omicsService.getRun(<GetRunCommandInput>{
    id: laboratoryRun.ExternalRunId,
  });

  return response.status || 'UNKNOWN';
}

async function getSeqeraCloudStatus(laboratoryRun: LaboratoryRun): Promise<string> {
  console.log('Fetching NF Tower status for run: ', laboratoryRun.RunId);
  const laboratory: Laboratory = await laboratoryService.queryByLaboratoryId(laboratoryRun.LaboratoryId);

  // Retrieve Seqera Cloud / NextFlow Tower AccessToken from SSM
  const getParameterResponse: GetParameterCommandOutput | void = await ssmService
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
  if (!getParameterResponse) {
    throw new LaboratoryAccessTokenUnavailableError();
  }

  const accessToken: string | undefined = getParameterResponse.Parameter?.Value;
  if (!accessToken) {
    throw new LaboratoryAccessTokenUnavailableError();
  }

  // Get Query Parameters for Seqera Cloud / NextFlow Tower APIs
  const apiQueryParameters: string = getNextFlowApiQueryParameters(undefined, laboratory.NextFlowTowerWorkspaceId);
  const response: DescribeWorkflowResponse = await httpRequest<DescribeWorkflowResponse>(
    `${process.env.SEQERA_API_BASE_URL}/workflow/${laboratoryRun.ExternalRunId}?${apiQueryParameters}`,
    REST_API_METHOD.GET,
    { Authorization: `Bearer ${accessToken}` },
  );

  return response.workflow?.status || 'UNKNOWN';
}
