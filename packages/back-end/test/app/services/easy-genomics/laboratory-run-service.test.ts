process.env.NAME_PREFIX = 'unit-test';

import { marshall } from '@aws-sdk/util-dynamodb';
import { LaboratoryRun } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-run';
import { LaboratoryRunAlreadyExistsError } from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { LaboratoryRunService } from '../../../../src/app/services/easy-genomics/laboratory-run-service';

describe('LaboratoryRunService.addOrGetExisting', () => {
  const validRun = (overrides: Partial<LaboratoryRun> = {}): LaboratoryRun =>
    ({
      LaboratoryId: '00000000-0000-0000-0000-000000000001',
      RunId: '00000000-0000-0000-0000-000000000002',
      UserId: '00000000-0000-0000-0000-000000000003',
      OrganizationId: '00000000-0000-0000-0000-000000000004',
      RunName: 'Test Run',
      Platform: 'AWS HealthOmics',
      Status: 'RUNNING',
      Owner: 'user@example.com',
      ...overrides,
    }) as LaboratoryRun;

  it('creates the run on the first write', async () => {
    const svc = new LaboratoryRunService();
    const putItem = jest
      .spyOn(svc as unknown as { putItem: jest.Mock }, 'putItem')
      .mockResolvedValue({ $metadata: { httpStatusCode: 200 } });

    const run = validRun();
    const result = await svc.addOrGetExisting(run, run.UserId);

    expect(result).toEqual(run);
    expect(putItem).toHaveBeenCalled();
    putItem.mockRestore();
  });

  it('returns the existing run when the same user retries with the same RunId', async () => {
    const svc = new LaboratoryRunService();
    const conditionalError = new Error('ConditionalCheckFailedException');
    conditionalError.name = 'ConditionalCheckFailedException';
    const putItem = jest.spyOn(svc as unknown as { putItem: jest.Mock }, 'putItem').mockRejectedValue(conditionalError);
    const existing = validRun({ RunName: 'First attempt' });
    const get = jest.spyOn(svc, 'get').mockResolvedValue(existing);

    const retry = validRun({ RunName: 'Retry attempt' });
    const result = await svc.addOrGetExisting(retry, retry.UserId);

    expect(result).toEqual(existing);
    expect(get).toHaveBeenCalledWith(retry.LaboratoryId, retry.RunId);
    putItem.mockRestore();
    get.mockRestore();
  });

  it('throws LaboratoryRunAlreadyExistsError when the existing run belongs to a different user', async () => {
    const svc = new LaboratoryRunService();
    const conditionalError = new Error('ConditionalCheckFailedException');
    conditionalError.name = 'ConditionalCheckFailedException';
    const putItem = jest.spyOn(svc as unknown as { putItem: jest.Mock }, 'putItem').mockRejectedValue(conditionalError);
    const existing = validRun({ UserId: '00000000-0000-0000-0000-000000000099' });
    const get = jest.spyOn(svc, 'get').mockResolvedValue(existing);

    const requester = validRun();

    await expect(svc.addOrGetExisting(requester, requester.UserId)).rejects.toThrow(LaboratoryRunAlreadyExistsError);
    putItem.mockRestore();
    get.mockRestore();
  });

  it('rethrows non-conditional errors instead of swallowing them', async () => {
    const svc = new LaboratoryRunService();
    const transientError = new Error('ProvisionedThroughputExceededException');
    transientError.name = 'ProvisionedThroughputExceededException';
    const putItem = jest.spyOn(svc as unknown as { putItem: jest.Mock }, 'putItem').mockRejectedValue(transientError);

    const run = validRun();

    await expect(svc.addOrGetExisting(run, run.UserId)).rejects.toThrow('ProvisionedThroughputExceededException');
    putItem.mockRestore();
  });
});

describe('LaboratoryRunService.markTerminalNotified', () => {
  it('publishes (returns published: true) on the first terminal write', async () => {
    const svc = new LaboratoryRunService();
    const updateItem = jest.spyOn(svc as unknown as { updateItem: jest.Mock }, 'updateItem').mockResolvedValue({
      $metadata: { httpStatusCode: 200 },
      Attributes: marshall({ LaboratoryId: 'lab-1', RunId: 'run-1', NotifiedAt: '2026-07-24T00:00:00.000Z' }),
    });

    const result = await svc.markTerminalNotified({
      LaboratoryId: 'lab-1',
      RunId: 'run-1',
      ModifiedAt: '2026-07-24T00:00:00.000Z',
      ModifiedBy: 'Status Check',
    });

    expect(result.published).toBe(true);
    expect(result.run.NotifiedAt).toBe('2026-07-24T00:00:00.000Z');
    expect(updateItem.mock.calls[0][0]).toMatchObject({
      ConditionExpression: 'attribute_not_exists(#NotifiedAt)',
      UpdateExpression: expect.stringContaining('REMOVE #PollStatus'),
    });
    updateItem.mockRestore();
  });

  it('does not publish a second time (returns published: false) when NotifiedAt already exists', async () => {
    const svc = new LaboratoryRunService();
    const conditionalError = new Error('ConditionalCheckFailedException');
    conditionalError.name = 'ConditionalCheckFailedException';
    const updateItem = jest
      .spyOn(svc as unknown as { updateItem: jest.Mock }, 'updateItem')
      .mockRejectedValue(conditionalError);
    const get = jest
      .spyOn(svc, 'get')
      .mockResolvedValue({ LaboratoryId: 'lab-1', RunId: 'run-1', NotifiedAt: '2026-07-24T00:00:00.000Z' } as any);

    const result = await svc.markTerminalNotified({
      LaboratoryId: 'lab-1',
      RunId: 'run-1',
      ModifiedAt: '2026-07-24T00:01:00.000Z',
      ModifiedBy: 'Status Check',
    });

    expect(result.published).toBe(false);
    updateItem.mockRestore();
    get.mockRestore();
  });

  it('rethrows non-conditional errors instead of swallowing them', async () => {
    const svc = new LaboratoryRunService();
    const transientError = new Error('ProvisionedThroughputExceededException');
    transientError.name = 'ProvisionedThroughputExceededException';
    const updateItem = jest
      .spyOn(svc as unknown as { updateItem: jest.Mock }, 'updateItem')
      .mockRejectedValue(transientError);

    await expect(
      svc.markTerminalNotified({
        LaboratoryId: 'lab-1',
        RunId: 'run-1',
        ModifiedAt: '2026-07-24T00:01:00.000Z',
        ModifiedBy: 'Status Check',
      }),
    ).rejects.toBe(transientError);

    updateItem.mockRestore();
  });
});

describe('LaboratoryRunService.queryActiveForPolling', () => {
  it('queries the PollStatus_Index and returns every active run across pages', async () => {
    const svc = new LaboratoryRunService();
    const queryItems = jest.spyOn(svc as unknown as { queryItems: jest.Mock }, 'queryItems');
    queryItems
      .mockResolvedValueOnce({
        $metadata: { httpStatusCode: 200 },
        Items: [marshall({ LaboratoryId: 'lab-1', RunId: 'run-1', PollStatus: 'ACTIVE' })],
        LastEvaluatedKey: { LaboratoryId: { S: 'lab-1' }, RunId: { S: 'run-1' } },
      })
      .mockResolvedValueOnce({
        $metadata: { httpStatusCode: 200 },
        Items: [marshall({ LaboratoryId: 'lab-2', RunId: 'run-2', PollStatus: 'ACTIVE' })],
      });

    const results = await svc.queryActiveForPolling();

    expect(results).toHaveLength(2);
    expect(results.map((r) => r.RunId)).toEqual(['run-1', 'run-2']);
    expect(queryItems.mock.calls[0][0]).toMatchObject({ IndexName: 'PollStatus_Index' });
    queryItems.mockRestore();
  });
});
