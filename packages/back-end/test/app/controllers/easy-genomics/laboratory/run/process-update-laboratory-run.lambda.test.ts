import { GetRunCommandInput } from '@aws-sdk/client-omics';
import { GetParameterCommandOutput, ParameterNotFound } from '@aws-sdk/client-ssm';
import { Context } from 'aws-lambda';
import { SQSEvent, SQSRecord } from 'aws-lambda/trigger/sqs';

import {
  handler,
  getAWSHealthOmicsStatus,
  getSeqeraCloudStatus,
  processStatusCheckEvent,
} from '../../../../../../src/app/controllers/easy-genomics/laboratory/run/process-update-laboratory-run.lambda';

jest.mock('../../../../../../src/app/services/easy-genomics/laboratory-service');
jest.mock('../../../../../../src/app/services/easy-genomics/laboratory-run-service');
jest.mock('../../../../../../src/app/services/easy-genomics/run-cost-capture-service');
jest.mock('../../../../../../src/app/services/ssm-service');
jest.mock('../../../../../../src/app/services/sqs-service');
jest.mock('../../../../../../src/app/services/omics-lab-factory');
jest.mock('../../../../../../src/app/utils/rest-api-utils');

import { LaboratoryRunService } from '../../../../../../src/app/services/easy-genomics/laboratory-run-service';
import { LaboratoryService } from '../../../../../../src/app/services/easy-genomics/laboratory-service';
import { captureRunCostOutcome } from '../../../../../../src/app/services/easy-genomics/run-cost-capture-service';
import { createOmicsServiceForLab } from '../../../../../../src/app/services/omics-lab-factory';
import { SqsService } from '../../../../../../src/app/services/sqs-service';
import { SsmService } from '../../../../../../src/app/services/ssm-service';
import { getNextFlowApiQueryParameters, httpRequest } from '../../../../../../src/app/utils/rest-api-utils';

describe('process-update-laboratory-run.lambda', () => {
  let mockLabService: jest.MockedClass<typeof LaboratoryService>;
  let mockRunService: jest.MockedClass<typeof LaboratoryRunService>;
  let mockSsmService: jest.MockedClass<typeof SsmService>;
  let mockSqsService: jest.MockedClass<typeof SqsService>;

  let mockQueryByRunId: jest.Mock;
  let mockUpdateRun: jest.Mock;
  let mockUpdateWithAttributeRemoval: jest.Mock;
  let mockQueryByLaboratoryId: jest.Mock;
  let mockGetParameter: jest.Mock;
  let mockGetRun: jest.Mock;
  let mockPublish: jest.Mock;

  const createEvent = (records: SQSRecord[]): SQSEvent =>
    ({
      Records: records,
    }) as any;

  const createContext = (): Context =>
    ({
      functionName: 'process-update-laboratory-run',
      functionVersion: '$LATEST',
      invokedFunctionArn: 'arn:aws:lambda:region:acct:function:process-update-laboratory-run',
      memoryLimitInMB: '128',
      awsRequestId: 'req-id',
      logGroupName: '/aws/lambda/process-update-laboratory-run',
      logStreamName: '2026/03/11/[$LATEST]test',
      identity: undefined,
      clientContext: undefined,
      callbackWaitsForEmptyEventLoop: true,
      getRemainingTimeInMillis: () => 30000,
      done: jest.fn(),
      fail: jest.fn(),
      succeed: jest.fn(),
    }) as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLabService = LaboratoryService as jest.MockedClass<typeof LaboratoryService>;
    mockRunService = LaboratoryRunService as jest.MockedClass<typeof LaboratoryRunService>;
    mockSsmService = SsmService as jest.MockedClass<typeof SsmService>;
    mockSqsService = SqsService as jest.MockedClass<typeof SqsService>;

    mockQueryByRunId = jest.fn();
    mockUpdateWithAttributeRemoval = jest.fn();
    // Status-check path uses updateWithAttributeRemoval; backfill still uses update.
    // Point both at the same mock so existing status-transition assertions keep working.
    mockUpdateRun = mockUpdateWithAttributeRemoval;
    mockQueryByLaboratoryId = jest.fn();
    mockGetParameter = jest.fn();
    mockGetRun = jest.fn();
    mockPublish = jest.fn().mockResolvedValue({});

    mockRunService.prototype.queryByRunId = mockQueryByRunId;
    mockRunService.prototype.update = mockUpdateRun;
    mockRunService.prototype.updateWithAttributeRemoval = mockUpdateWithAttributeRemoval;
    mockLabService.prototype.queryByLaboratoryId = mockQueryByLaboratoryId;
    mockSsmService.prototype.getParameter = mockGetParameter;
    mockSqsService.prototype.sendMessage = mockPublish;
    (createOmicsServiceForLab as jest.Mock).mockResolvedValue({
      getRun: mockGetRun,
      // Default: progress fetch fails (best-effort). Tests that need task progress mock this explicitly.
      listAllRunTasks: jest.fn().mockRejectedValue(new Error('listAllRunTasks not mocked')),
    });
    (captureRunCostOutcome as jest.Mock).mockResolvedValue(undefined);

    mockQueryByLaboratoryId.mockResolvedValue({
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      RunRetentionMonths: 0,
    });

    (getNextFlowApiQueryParameters as jest.Mock).mockReturnValue('workspaceId=ws-1');
    process.env.SEQERA_API_BASE_URL = 'https://tower.example.com';
  });

  it('updates run status for AWS HealthOmics platform', async () => {
    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-1',
      Status: 'PENDING',
      Platform: 'AWS HealthOmics',
    });

    mockGetRun.mockResolvedValue({
      status: 'SUCCEEDED',
    } as any);

    mockUpdateRun.mockResolvedValue({
      RunId: 'run-1',
      Status: 'SUCCEEDED',
    });

    const snsBody = {
      Message: JSON.stringify({
        Operation: 'UPDATE',
        Type: 'LaboratoryRun',
        Record: { RunId: 'run-1', LaboratoryId: 'lab-1' },
      }),
    };

    const event = createEvent([{ body: JSON.stringify(snsBody) } as any]);

    const result = await handler(event, createContext(), () => {});

    expect(result.statusCode).toBe(200);
    expect(createOmicsServiceForLab as jest.Mock).toHaveBeenCalledWith('lab-1', 'org-1', 'status-check');
    expect(mockGetRun).toHaveBeenCalledWith(<GetRunCommandInput>{ id: 'ext-1' });
    expect(mockRunService.prototype.update).toHaveBeenCalled();
  });

  it('skips update when run has no ExternalRunId', async () => {
    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: undefined,
      Status: 'PENDING',
      Platform: 'AWS HealthOmics',
    });

    const snsBody = {
      Message: JSON.stringify({
        Operation: 'UPDATE',
        Type: 'LaboratoryRun',
        Record: { RunId: 'run-1', LaboratoryId: 'lab-1' },
      }),
    };

    const event = createEvent([{ body: JSON.stringify(snsBody) } as any]);

    const result = await handler(event, createContext(), () => {});

    expect(result.statusCode).toBe(200);
    expect(mockGetRun).not.toHaveBeenCalled();
    expect(mockRunService.prototype.update).not.toHaveBeenCalled();
  });

  it('uses Seqera Cloud to update status and honors access token from SSM', async () => {
    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-1',
      Status: 'RUNNING',
      Platform: 'Seqera Cloud',
    });

    mockQueryByLaboratoryId.mockResolvedValue({
      OrganizationId: 'org-1',
      LaboratoryId: 'lab-1',
      NextFlowTowerWorkspaceId: 'ws-1',
    });

    const ssmResponse: GetParameterCommandOutput = {
      $metadata: {},
      Parameter: { Value: 'token' },
    };
    mockGetParameter.mockResolvedValue(ssmResponse);

    (httpRequest as jest.Mock).mockResolvedValue({
      workflow: { status: 'COMPLETED' },
    });

    mockUpdateRun.mockResolvedValue({
      RunId: 'run-1',
      Status: 'COMPLETED',
    });

    const snsBody = {
      Message: JSON.stringify({
        Operation: 'UPDATE',
        Type: 'LaboratoryRun',
        Record: { RunId: 'run-1', LaboratoryId: 'lab-1' },
      }),
    };

    const event = createEvent([{ body: JSON.stringify(snsBody) } as any]);

    const result = await handler(event, createContext(), () => {});

    expect(result.statusCode).toBe(200);
    expect(mockSsmService.prototype.getParameter).toHaveBeenCalled();
    expect(httpRequest as jest.Mock).toHaveBeenCalled();
    expect(mockRunService.prototype.update).toHaveBeenCalled();
  });

  it('handles missing SSM parameter by throwing LaboratoryAccessTokenUnavailableError', async () => {
    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-1',
      Status: 'RUNNING',
      Platform: 'Seqera Cloud',
    });

    mockQueryByLaboratoryId.mockResolvedValue({
      OrganizationId: 'org-1',
      LaboratoryId: 'lab-1',
      NextFlowTowerWorkspaceId: 'ws-1',
    });

    mockGetParameter.mockRejectedValue(new ParameterNotFound({ message: 'Parameter not found', $metadata: {} } as any));

    const snsBody = {
      Message: JSON.stringify({
        Operation: 'UPDATE',
        Type: 'LaboratoryRun',
        Record: { RunId: 'run-1', LaboratoryId: 'lab-1' },
      }),
    };

    const event = createEvent([{ body: JSON.stringify(snsBody) } as any]);

    const result = await handler(event, createContext(), () => {});

    expect(result.statusCode).toBe(400);
  });

  it('getAWSHealthOmicsStatus returns status and computes durationSeconds from startTime/stopTime', async () => {
    const start = new Date('2026-04-01T12:00:00.000Z');
    const stop = new Date('2026-04-01T13:30:00.000Z'); // 90 minutes = 5400 seconds
    mockGetRun
      .mockResolvedValueOnce({ status: 'COMPLETED', startTime: start, stopTime: stop } as any)
      .mockResolvedValueOnce({} as any);

    const snapshot1 = await getAWSHealthOmicsStatus({
      RunId: 'run-1',
      ExternalRunId: 'ext-1',
    } as any);
    const snapshot2 = await getAWSHealthOmicsStatus({
      RunId: 'run-2',
      ExternalRunId: 'ext-2',
    } as any);

    expect(snapshot1.status).toBe('COMPLETED');
    expect(snapshot1.durationSeconds).toBe(5400);
    expect(snapshot2.status).toBe('UNKNOWN');
    expect(snapshot2.durationSeconds).toBeUndefined();
    expect(mockGetRun).toHaveBeenNthCalledWith(1, <GetRunCommandInput>{ id: 'ext-1' });
    expect(mockGetRun).toHaveBeenNthCalledWith(2, <GetRunCommandInput>{ id: 'ext-2' });
  });

  it('getAWSHealthOmicsStatus propagates errors from OmicsService', async () => {
    mockGetRun.mockRejectedValue(new Error('omics failure'));

    await expect(getAWSHealthOmicsStatus({ RunId: 'run-err', ExternalRunId: 'ext-err' } as any)).rejects.toThrow(
      'omics failure',
    );
  });

  it('getSeqeraCloudStatus builds NF Tower URL with workspaceId and returns workflow status', async () => {
    mockQueryByLaboratoryId.mockResolvedValue({
      OrganizationId: 'org-1',
      LaboratoryId: 'lab-1',
      NextFlowTowerWorkspaceId: 'ws-1',
    });

    const ssmResponse: GetParameterCommandOutput = {
      $metadata: {},
      Parameter: { Value: 'token' },
    };
    mockGetParameter.mockResolvedValue(ssmResponse);

    (getNextFlowApiQueryParameters as jest.Mock).mockReturnValue('workspaceId=ws-1');
    (httpRequest as jest.Mock).mockResolvedValue({
      workflow: {
        status: 'SUCCEEDED',
        duration: 5_400_000, // ms -> 5400 seconds
        start: '2026-04-01T12:00:00.000Z',
        complete: '2026-04-01T13:30:00.000Z',
      },
    });

    const snapshot = await getSeqeraCloudStatus({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      ExternalRunId: 'ext-1',
    } as any);

    expect(snapshot.status).toBe('SUCCEEDED');
    expect(snapshot.durationSeconds).toBe(5400);
    expect(getNextFlowApiQueryParameters as jest.Mock).toHaveBeenCalledWith(undefined, 'ws-1');
    expect(httpRequest as jest.Mock).toHaveBeenCalledWith(
      expect.stringContaining('/workflow/ext-1?workspaceId=ws-1'),
      expect.anything(),
      expect.objectContaining({ Authorization: expect.stringContaining('Bearer') }),
    );
  });

  it('getSeqeraCloudStatus throws when SSM returns no Parameter or no Value', async () => {
    mockQueryByLaboratoryId.mockResolvedValue({
      OrganizationId: 'org-1',
      LaboratoryId: 'lab-1',
      NextFlowTowerWorkspaceId: 'ws-1',
    });

    const ssmNoParam: GetParameterCommandOutput = { $metadata: {}, Parameter: undefined };
    mockGetParameter.mockResolvedValueOnce(ssmNoParam);

    await expect(
      getSeqeraCloudStatus({ RunId: 'run-1', LaboratoryId: 'lab-1', ExternalRunId: 'ext-1' } as any),
    ).rejects.toThrow();

    const ssmNoValue: GetParameterCommandOutput = { $metadata: {}, Parameter: { Value: undefined } as any };
    mockGetParameter.mockResolvedValueOnce(ssmNoValue);

    await expect(
      getSeqeraCloudStatus({ RunId: 'run-2', LaboratoryId: 'lab-1', ExternalRunId: 'ext-2' } as any),
    ).rejects.toThrow();
  });

  it('getSeqeraCloudStatus returns UNKNOWN when workflow status is missing', async () => {
    mockQueryByLaboratoryId.mockResolvedValue({
      OrganizationId: 'org-1',
      LaboratoryId: 'lab-1',
      NextFlowTowerWorkspaceId: 'ws-1',
    });

    const ssmResponse: GetParameterCommandOutput = {
      $metadata: {},
      Parameter: { Value: 'token' },
    };
    mockGetParameter.mockResolvedValue(ssmResponse);

    (getNextFlowApiQueryParameters as jest.Mock).mockReturnValue('workspaceId=ws-1');
    (httpRequest as jest.Mock).mockResolvedValue({});

    const snapshot = await getSeqeraCloudStatus({
      RunId: 'run-3',
      LaboratoryId: 'lab-1',
      ExternalRunId: 'ext-3',
    } as any);

    expect(snapshot.status).toBe('UNKNOWN');
    expect(snapshot.durationSeconds).toBeUndefined();
  });

  it('getSeqeraCloudStatus falls back to start/complete when duration is missing', async () => {
    mockQueryByLaboratoryId.mockResolvedValue({
      OrganizationId: 'org-1',
      LaboratoryId: 'lab-1',
      NextFlowTowerWorkspaceId: 'ws-1',
    });

    const ssmResponse: GetParameterCommandOutput = {
      $metadata: {},
      Parameter: { Value: 'token' },
    };
    mockGetParameter.mockResolvedValue(ssmResponse);

    (getNextFlowApiQueryParameters as jest.Mock).mockReturnValue('workspaceId=ws-1');
    (httpRequest as jest.Mock).mockResolvedValue({
      workflow: {
        status: 'SUCCEEDED',
        start: '2026-04-01T12:00:00.000Z',
        complete: '2026-04-01T13:30:00.000Z',
      },
    });

    const snapshot = await getSeqeraCloudStatus({
      RunId: 'run-4',
      LaboratoryId: 'lab-1',
      ExternalRunId: 'ext-4',
    } as any);

    expect(snapshot.status).toBe('SUCCEEDED');
    expect(snapshot.durationSeconds).toBe(5400);
  });

  it('processStatusCheckEvent returns true for non-UPDATE operations', async () => {
    const result = await processStatusCheckEvent('DELETE' as any, { RunId: 'run-1' } as any);
    expect(result).toBe(true);
  });

  it('processStatusCheckEvent skips update when status has not changed', async () => {
    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-1',
      Status: 'RUNNING',
      Platform: 'AWS HealthOmics',
    });

    mockGetRun.mockResolvedValue({
      status: 'RUNNING',
    } as any);

    const result = await processStatusCheckEvent('UPDATE', { RunId: 'run-1' } as any);

    expect(result).toBe(true);
    expect(mockRunService.prototype.update).not.toHaveBeenCalled();
  });

  it('processStatusCheckEvent does not update when status change is only casing difference', async () => {
    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-2',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-2',
      Status: 'running',
      Platform: 'AWS HealthOmics',
    });

    mockGetRun.mockResolvedValue({
      status: 'RUNNING',
    } as any);

    const result = await processStatusCheckEvent('UPDATE', { RunId: 'run-2' } as any);

    expect(result).toBe(true);
    expect(mockRunService.prototype.update).not.toHaveBeenCalled();
  });

  it('processStatusCheckEvent propagates errors from queryByRunId', async () => {
    mockQueryByRunId.mockRejectedValue(new Error('lookup failed'));

    await expect(processStatusCheckEvent('UPDATE', { RunId: 'run-err' } as any)).rejects.toThrow('lookup failed');
  });

  it('getAWSHealthOmicsStatus returns failureReason and statusMessage as separate fields', async () => {
    mockGetRun.mockResolvedValue({
      status: 'FAILED',
      failureReason: 'ECR_PERMISSION_ERROR',
      statusMessage: 'Cannot access ECR image (human-readable)',
    } as any);

    const snapshot = await getAWSHealthOmicsStatus({ RunId: 'run-1', ExternalRunId: 'ext-1' } as any);

    expect(snapshot.status).toBe('FAILED');
    expect(snapshot.failureReason).toBe('ECR_PERMISSION_ERROR');
    expect(snapshot.statusMessage).toBe('Cannot access ECR image (human-readable)');
  });

  it('getAWSHealthOmicsStatus keeps statusMessage distinct and does not collapse it into failureReason', async () => {
    mockGetRun.mockResolvedValue({
      status: 'FAILED',
      statusMessage: 'Engine failure — see CloudWatch',
    } as any);

    const snapshot = await getAWSHealthOmicsStatus({ RunId: 'run-1', ExternalRunId: 'ext-1' } as any);

    expect(snapshot.failureReason).toBeUndefined();
    expect(snapshot.statusMessage).toBe('Engine failure — see CloudWatch');
  });

  it('getAWSHealthOmicsStatus leaves both failure fields undefined when neither is present', async () => {
    mockGetRun.mockResolvedValue({ status: 'SUCCEEDED' } as any);

    const snapshot = await getAWSHealthOmicsStatus({ RunId: 'run-1', ExternalRunId: 'ext-1' } as any);

    expect(snapshot.failureReason).toBeUndefined();
    expect(snapshot.statusMessage).toBeUndefined();
  });

  it('getSeqeraCloudStatus returns failureReason from workflow.errorMessage', async () => {
    mockQueryByLaboratoryId.mockResolvedValue({
      OrganizationId: 'org-1',
      LaboratoryId: 'lab-1',
      NextFlowTowerWorkspaceId: 'ws-1',
    });

    const ssmResponse: GetParameterCommandOutput = {
      $metadata: {},
      Parameter: { Value: 'token' },
    };
    mockGetParameter.mockResolvedValue(ssmResponse);

    (httpRequest as jest.Mock).mockResolvedValue({
      workflow: {
        status: 'FAILED',
        errorMessage: 'Process samplesheet_check failed with exit code 1',
        errorReport: 'Caused by:\n  Process `samplesheet_check` terminated with an error exit status (1)',
      },
    });

    const snapshot = await getSeqeraCloudStatus({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      ExternalRunId: 'ext-1',
    } as any);

    expect(snapshot.status).toBe('FAILED');
    expect(snapshot.failureReason).toBe('Process samplesheet_check failed with exit code 1');
    expect(snapshot.errorReport).toBe(
      'Caused by:\n  Process `samplesheet_check` terminated with an error exit status (1)',
    );
  });

  it('processStatusCheckEvent persists FailureReason on FAILED transition for HealthOmics', async () => {
    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-1',
      Status: 'RUNNING',
      Platform: 'AWS HealthOmics',
    });

    mockGetRun.mockResolvedValue({
      status: 'FAILED',
      failureReason: 'OUT_OF_MEMORY_ERROR',
      statusMessage: 'Task nf-core/rnaseq:FASTQC ran out of memory — see CloudWatch',
    } as any);

    mockUpdateRun.mockResolvedValue({ RunId: 'run-1', Status: 'FAILED' });

    await processStatusCheckEvent('UPDATE', { RunId: 'run-1' } as any);

    expect(mockUpdateRun).toHaveBeenCalledWith(
      expect.objectContaining({
        Status: 'FAILED',
        FailureReason: 'OUT_OF_MEMORY_ERROR',
        FailureStatusMessage: 'Task nf-core/rnaseq:FASTQC ran out of memory — see CloudWatch',
      }),
      ['CurrentProcessName'],
    );
  });

  it('processStatusCheckEvent persists FailureReason on FAILED transition for Seqera Cloud', async () => {
    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-1',
      Status: 'RUNNING',
      Platform: 'Seqera Cloud',
    });

    mockQueryByLaboratoryId.mockResolvedValue({
      OrganizationId: 'org-1',
      LaboratoryId: 'lab-1',
      NextFlowTowerWorkspaceId: 'ws-1',
    });

    const ssmResponse: GetParameterCommandOutput = {
      $metadata: {},
      Parameter: { Value: 'token' },
    };
    mockGetParameter.mockResolvedValue(ssmResponse);

    (httpRequest as jest.Mock).mockResolvedValue({
      workflow: {
        status: 'FAILED',
        errorMessage: 'Sample sheet parsing failed',
        errorReport: 'Caused by:\n  Missing required column "sample" in samplesheet.csv',
      },
    });

    mockUpdateRun.mockResolvedValue({ RunId: 'run-1', Status: 'FAILED' });

    await processStatusCheckEvent('UPDATE', { RunId: 'run-1' } as any);

    expect(mockUpdateRun).toHaveBeenCalledWith(
      expect.objectContaining({
        Status: 'FAILED',
        FailureReason: 'Sample sheet parsing failed',
        FailureErrorReport: 'Caused by:\n  Missing required column "sample" in samplesheet.csv',
      }),
      ['CurrentProcessName'],
    );
  });

  it('processStatusCheckEvent does not overwrite existing FailureReason on subsequent FAILED status checks', async () => {
    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-1',
      Status: 'RUNNING',
      Platform: 'AWS HealthOmics',
      FailureReason: 'ECR_PERMISSION_ERROR',
    });

    mockGetRun.mockResolvedValue({
      status: 'FAILED',
      failureReason: 'SHOULD_NOT_OVERWRITE',
    } as any);

    mockUpdateRun.mockResolvedValue({ RunId: 'run-1', Status: 'FAILED' });

    await processStatusCheckEvent('UPDATE', { RunId: 'run-1' } as any);

    const updateArg = mockUpdateRun.mock.calls[0][0];
    expect(updateArg.FailureReason).toBe('ECR_PERMISSION_ERROR');
  });

  it('processStatusCheckEvent does not write FailureReason on non-FAILED transitions', async () => {
    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-1',
      Status: 'RUNNING',
      Platform: 'AWS HealthOmics',
    });

    mockGetRun.mockResolvedValue({
      status: 'SUCCEEDED',
      failureReason: 'IRRELEVANT',
    } as any);

    mockUpdateRun.mockResolvedValue({ RunId: 'run-1', Status: 'SUCCEEDED' });

    await processStatusCheckEvent('UPDATE', { RunId: 'run-1' } as any);

    const updateArg = mockUpdateRun.mock.calls[0][0];
    expect(updateArg.FailureReason).toBeUndefined();
  });

  it('safePublishForClassification: publishes to SNS when run transitions to FAILED and FailureOwner is unset', async () => {
    process.env.SQS_LABORATORY_RUN_FAILURE_CLASSIFICATION_QUEUE_URL = 'arn:aws:sns:us-east-1:123:classify.fifo';

    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-1',
      Status: 'RUNNING',
      Platform: 'AWS HealthOmics',
    });

    mockGetRun.mockResolvedValue({ status: 'FAILED', failureReason: 'OUT_OF_MEMORY_ERROR' } as any);
    mockUpdateRun.mockResolvedValue({ RunId: 'run-1', Status: 'FAILED' });

    await processStatusCheckEvent('UPDATE', { RunId: 'run-1' } as any);

    expect(mockPublish).toHaveBeenCalledWith(
      expect.objectContaining({
        QueueUrl: 'arn:aws:sns:us-east-1:123:classify.fifo',
        MessageGroupId: 'classify-laboratory-run-run-1',
      }),
    );
  });

  it('safePublishForClassification: skips publish when FailureOwner is already set', async () => {
    process.env.SQS_LABORATORY_RUN_FAILURE_CLASSIFICATION_QUEUE_URL = 'arn:aws:sns:us-east-1:123:classify.fifo';

    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-1',
      Status: 'RUNNING',
      Platform: 'AWS HealthOmics',
      FailureOwner: 'Bioinformatician',
    });

    mockGetRun.mockResolvedValue({ status: 'FAILED', failureReason: 'ECR_PERMISSION_ERROR' } as any);
    mockUpdateRun.mockResolvedValue({ RunId: 'run-1', Status: 'FAILED' });

    await processStatusCheckEvent('UPDATE', { RunId: 'run-1' } as any);

    expect(mockPublish).not.toHaveBeenCalled();
  });

  it('safePublishForClassification: skips publish when topic ARN env var is unset', async () => {
    delete process.env.SQS_LABORATORY_RUN_FAILURE_CLASSIFICATION_QUEUE_URL;

    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-1',
      Status: 'RUNNING',
      Platform: 'AWS HealthOmics',
    });

    mockGetRun.mockResolvedValue({ status: 'FAILED', failureReason: 'OUT_OF_MEMORY_ERROR' } as any);
    mockUpdateRun.mockResolvedValue({ RunId: 'run-1', Status: 'FAILED' });

    await processStatusCheckEvent('UPDATE', { RunId: 'run-1' } as any);

    expect(mockPublish).not.toHaveBeenCalled();
  });

  it('safePublishForClassification: swallows SNS errors so the status-check pipeline completes', async () => {
    process.env.SQS_LABORATORY_RUN_FAILURE_CLASSIFICATION_QUEUE_URL = 'arn:aws:sns:us-east-1:123:classify.fifo';
    mockPublish.mockRejectedValue(new Error('SNS unavailable'));

    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-1',
      Status: 'RUNNING',
      Platform: 'AWS HealthOmics',
    });

    mockGetRun.mockResolvedValue({ status: 'FAILED', failureReason: 'OUT_OF_MEMORY_ERROR' } as any);
    mockUpdateRun.mockResolvedValue({ RunId: 'run-1', Status: 'FAILED' });

    await expect(processStatusCheckEvent('UPDATE', { RunId: 'run-1' } as any)).resolves.toBe(true);
    expect(mockPublish).toHaveBeenCalled();
  });

  it('attaches RunCostOutcome when transitioning to a terminal status', async () => {
    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-1',
      Status: 'RUNNING',
      Platform: 'AWS HealthOmics',
    });
    mockGetRun.mockResolvedValue({
      status: 'SUCCEEDED',
      startTime: new Date('2026-01-01T00:00:00Z'),
      stopTime: new Date('2026-01-01T01:00:00Z'),
    } as any);
    (captureRunCostOutcome as jest.Mock).mockResolvedValue({
      ActualComputeCostUsd: 4.2,
      CostSource: 'HEALTHOMICS_TASKS',
      CostCapturedAt: '2026-01-01T02:00:00Z',
    });
    mockUpdateRun.mockImplementation(async (r) => r);

    await processStatusCheckEvent('UPDATE', { RunId: 'run-1' } as any);

    expect(captureRunCostOutcome).toHaveBeenCalled();
    expect(mockUpdateRun).toHaveBeenCalledWith(
      expect.objectContaining({
        Status: 'SUCCEEDED',
        RunCostOutcome: expect.objectContaining({ ActualComputeCostUsd: 4.2 }),
      }),
      expect.any(Array),
    );
  });

  it('swallows cost-capture failures on terminal transition', async () => {
    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-1',
      Status: 'RUNNING',
      Platform: 'AWS HealthOmics',
    });
    mockGetRun.mockResolvedValue({ status: 'SUCCEEDED' } as any);
    (captureRunCostOutcome as jest.Mock).mockRejectedValue(new Error('capture failed'));
    mockUpdateRun.mockImplementation(async (r) => r);

    await expect(processStatusCheckEvent('UPDATE', { RunId: 'run-1' } as any)).resolves.toBe(true);
    expect(mockUpdateRun).toHaveBeenCalledWith(
      expect.objectContaining({
        Status: 'SUCCEEDED',
      }),
      expect.any(Array),
    );
    expect(mockUpdateRun).toHaveBeenCalledWith(
      expect.not.objectContaining({ RunCostOutcome: expect.anything() }),
      expect.any(Array),
    );
  });

  it('backfills RunCostOutcome for already-terminal runs missing cost', async () => {
    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-1',
      Status: 'SUCCEEDED',
      Platform: 'AWS HealthOmics',
      TerminalAt: '2026-01-01T00:00:00Z',
      RunDurationSeconds: 100,
    });
    (captureRunCostOutcome as jest.Mock).mockResolvedValue({
      ActualComputeCostUsd: 9,
      CostSource: 'HEALTHOMICS_TASKS',
      CostCapturedAt: '2026-01-02T00:00:00Z',
    });
    mockUpdateRun.mockImplementation(async (r) => r);

    await processStatusCheckEvent('UPDATE', { RunId: 'run-1' } as any);

    expect(captureRunCostOutcome).toHaveBeenCalled();
    expect(mockUpdateRun).toHaveBeenCalledWith(
      expect.objectContaining({
        RunCostOutcome: expect.objectContaining({ ActualComputeCostUsd: 9 }),
      }),
    );
  });

  it('getSeqeraCloudStatus returns progress and currentProcessName for non-terminal runs', async () => {
    mockQueryByLaboratoryId.mockResolvedValue({
      OrganizationId: 'org-1',
      LaboratoryId: 'lab-1',
      NextFlowTowerWorkspaceId: 'ws-1',
    });

    mockGetParameter.mockResolvedValue({
      $metadata: {},
      Parameter: { Value: 'token' },
    });

    (getNextFlowApiQueryParameters as jest.Mock).mockReturnValue('workspaceId=ws-1');
    (httpRequest as jest.Mock)
      .mockResolvedValueOnce({
        workflow: { status: 'RUNNING', duration: 60_000 },
      })
      .mockResolvedValueOnce({
        progress: {
          workflowProgress: {
            pending: 1,
            submitted: 0,
            running: 2,
            succeeded: 5,
            failed: 0,
            cached: 0,
            cpus: 0,
            cpuTime: 0,
            cpuLoad: 0,
            memoryRss: 0,
            memoryReq: 0,
            readBytes: 0,
            writeBytes: 0,
            volCtxSwitch: 0,
            invCtxSwitch: 0,
            loadTasks: 0,
            loadCpus: 0,
            loadMemory: 0,
            peakCpus: 0,
            peakTasks: 0,
            peakMemory: 0,
          },
          processesProgress: [
            {
              process: 'BOWTIE2_ALIGN',
              pending: 0,
              submitted: 0,
              running: 2,
              succeeded: 0,
              failed: 0,
              cached: 0,
              cpus: 0,
              cpuTime: 0,
              cpuLoad: 0,
              memoryRss: 0,
              memoryReq: 0,
              readBytes: 0,
              writeBytes: 0,
              volCtxSwitch: 0,
              invCtxSwitch: 0,
              loadTasks: 0,
              loadCpus: 0,
              loadMemory: 0,
              peakCpus: 0,
              peakTasks: 0,
              peakMemory: 0,
            },
          ],
        },
      });

    const snapshot = await getSeqeraCloudStatus({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      ExternalRunId: 'ext-1',
    } as any);

    expect(snapshot.status).toBe('RUNNING');
    expect(snapshot.progress).toEqual(
      expect.objectContaining({
        tasksCompleted: 5,
        tasksRunning: 2,
        tasksTotal: 8,
        percent: 63,
        currentProcessName: 'BOWTIE2_ALIGN',
      }),
    );
    expect(httpRequest as jest.Mock).toHaveBeenCalledWith(
      expect.stringContaining('/workflow/ext-1/progress?workspaceId=ws-1'),
      expect.anything(),
      expect.anything(),
    );
  });

  it('getSeqeraCloudStatus continues when progress fetch fails', async () => {
    mockQueryByLaboratoryId.mockResolvedValue({
      OrganizationId: 'org-1',
      LaboratoryId: 'lab-1',
      NextFlowTowerWorkspaceId: 'ws-1',
    });
    mockGetParameter.mockResolvedValue({ $metadata: {}, Parameter: { Value: 'token' } });
    (getNextFlowApiQueryParameters as jest.Mock).mockReturnValue('workspaceId=ws-1');
    (httpRequest as jest.Mock)
      .mockResolvedValueOnce({ workflow: { status: 'RUNNING', duration: 1000 } })
      .mockRejectedValueOnce(new Error('progress unavailable'));

    const snapshot = await getSeqeraCloudStatus({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      ExternalRunId: 'ext-1',
    } as any);

    expect(snapshot.status).toBe('RUNNING');
    expect(snapshot.progress).toBeUndefined();
  });

  it('processStatusCheckEvent persists CurrentProcessName for Omics while RUNNING', async () => {
    const listAllRunTasks = jest.fn().mockResolvedValue([
      { taskId: '1', status: 'COMPLETED', name: 'FASTQC' },
      { taskId: '2', status: 'RUNNING', name: 'BOWTIE2_ALIGN' },
    ]);
    (createOmicsServiceForLab as jest.Mock).mockResolvedValue({
      getRun: mockGetRun,
      listAllRunTasks,
    });

    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-1',
      Status: 'RUNNING',
      Platform: 'AWS HealthOmics',
    });

    mockGetRun.mockResolvedValue({ status: 'RUNNING' } as any);
    mockUpdateRun.mockResolvedValue({ RunId: 'run-1', Status: 'RUNNING' });

    await processStatusCheckEvent('UPDATE', { RunId: 'run-1' } as any);

    expect(mockUpdateRun).toHaveBeenCalledWith(
      expect.objectContaining({
        ProgressPercent: 50,
        TasksCompleted: 1,
        TasksTotal: 2,
        CurrentProcessName: 'BOWTIE2_ALIGN',
      }),
      [],
    );
  });

  it('processStatusCheckEvent clears CurrentProcessName on terminal transition', async () => {
    mockQueryByRunId.mockResolvedValue({
      RunId: 'run-1',
      LaboratoryId: 'lab-1',
      OrganizationId: 'org-1',
      ExternalRunId: 'ext-1',
      Status: 'RUNNING',
      Platform: 'AWS HealthOmics',
      CurrentProcessName: 'BOWTIE2_ALIGN',
      ProgressPercent: 50,
    });

    mockGetRun.mockResolvedValue({ status: 'COMPLETED' } as any);
    mockUpdateRun.mockResolvedValue({ RunId: 'run-1', Status: 'COMPLETED' });

    await processStatusCheckEvent('UPDATE', { RunId: 'run-1' } as any);

    const [updateArg, removeArg] = mockUpdateRun.mock.calls[0];
    expect(updateArg.Status).toBe('COMPLETED');
    expect(updateArg.CurrentProcessName).toBeUndefined();
    expect(removeArg).toEqual(['CurrentProcessName']);
  });
});
