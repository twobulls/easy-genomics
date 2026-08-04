process.env.NAME_PREFIX = 'unit-test';

import { LaboratoryRunService } from '../../../../src/app/services/easy-genomics/laboratory-run-service';
import { LaboratoryRunAlreadyExistsError } from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { LaboratoryRun } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-run';

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
    const putItem = jest
      .spyOn(svc as unknown as { putItem: jest.Mock }, 'putItem')
      .mockRejectedValue(conditionalError);
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
    const putItem = jest
      .spyOn(svc as unknown as { putItem: jest.Mock }, 'putItem')
      .mockRejectedValue(conditionalError);
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
    const putItem = jest
      .spyOn(svc as unknown as { putItem: jest.Mock }, 'putItem')
      .mockRejectedValue(transientError);

    const run = validRun();

    await expect(svc.addOrGetExisting(run, run.UserId)).rejects.toThrow('ProvisionedThroughputExceededException');
    putItem.mockRestore();
  });
});
