import type { LaboratoryRun } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-run';

const SERVICE_MODULE_PATH = '../../src/app/services/easy-genomics/laboratory-run-service';
const SCRIPT_MODULE_PATH = '../../scripts/backfill-laboratory-run-attributes';

function buildRun(overrides: Partial<LaboratoryRun> & { CurrentProcessName?: string } = {}): LaboratoryRun {
  return {
    LaboratoryId: 'lab-1',
    RunId: 'run-1',
    UserId: 'user-1',
    OrganizationId: 'org-1',
    RunName: 'Test Run',
    Platform: 'AWS HealthOmics',
    Status: 'RUNNING',
    Owner: 'owner-1',
    ...overrides,
  };
}

interface ScriptRunResult {
  listAllLaboratoryRuns: jest.Mock;
  update: jest.Mock;
  updateWithAttributeRemoval: jest.Mock;
}

/**
 * Re-running the script per test requires a fresh module registry so the service it imports
 * picks up this call's mocked implementations. `main` is exported and awaited (auto-run is
 * skipped under Jest via JEST_WORKER_ID) to avoid racing a fire-and-forget side effect.
 */
async function runScript(
  argv: string[],
  runs: LaboratoryRun[],
  updateImpl: (run: LaboratoryRun) => Promise<LaboratoryRun> = async (run) => run,
  updateWithAttributeRemovalImpl: (run: LaboratoryRun, remove: string[]) => Promise<LaboratoryRun> = async (run) => run,
): Promise<ScriptRunResult> {
  jest.resetModules();
  jest.doMock(SERVICE_MODULE_PATH);

  // Jest's automock is generated at runtime from the real class, so the destructured export
  // isn't statically typed as mocked — cast loosely rather than fight the compiler for a test-only value.
  const { LaboratoryRunService } = (await import(SERVICE_MODULE_PATH)) as any;
  const listAllLaboratoryRuns = jest.fn().mockResolvedValue(runs);
  const update = jest.fn(updateImpl);
  const updateWithAttributeRemoval = jest.fn(updateWithAttributeRemovalImpl);
  LaboratoryRunService.prototype.listAllLaboratoryRuns = listAllLaboratoryRuns;
  LaboratoryRunService.prototype.update = update;
  LaboratoryRunService.prototype.updateWithAttributeRemoval = updateWithAttributeRemoval;

  process.argv = ['node', 'backfill-laboratory-run-attributes.ts', ...argv];
  const { main } = await import(SCRIPT_MODULE_PATH);
  await main();

  return { listAllLaboratoryRuns, update, updateWithAttributeRemoval };
}

describe('backfill-laboratory-run-attributes script', () => {
  // Every test here calls jest.resetModules() and re-imports the script and its whole dependency
  // tree via runScript(). That's inherently heavier than a typical unit test, and under CI's
  // parallel Jest workers the resulting CPU contention has pushed it past the 5s default.
  jest.setTimeout(15000);

  const originalArgv = process.argv;
  let exitSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env.NAME_PREFIX = 'test-prefix';
    process.env.REGION = 'us-east-1';
    exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => undefined as never);
    jest.spyOn(console, 'log').mockImplementation(() => undefined);
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    process.argv = originalArgv;
    jest.restoreAllMocks();
  });

  describe('Pass 1 - CurrentProcessName removal', () => {
    it('REMOVEs CurrentProcessName when present and skips runs that lack it', async () => {
      const runs = [
        buildRun({ RunId: 'run-with-legacy', CurrentProcessName: 'process_foo', PollStatus: 'ACTIVE' }),
        buildRun({ RunId: 'run-clean', PollStatus: 'ACTIVE' }),
      ];

      const { update, updateWithAttributeRemoval } = await runScript([], runs);

      expect(updateWithAttributeRemoval).toHaveBeenCalledTimes(1);
      expect(updateWithAttributeRemoval.mock.calls[0][0].RunId).toBe('run-with-legacy');
      expect(updateWithAttributeRemoval.mock.calls[0][0]).not.toHaveProperty('CurrentProcessName');
      expect(updateWithAttributeRemoval.mock.calls[0][1]).toEqual(['CurrentProcessName']);
      expect(update).not.toHaveBeenCalled();
      expect(exitSpy).not.toHaveBeenCalled();
    });

    it('only patches runs in the laboratory given via --lab', async () => {
      const runs = [
        buildRun({
          RunId: 'run-lab-1',
          LaboratoryId: 'lab-1',
          CurrentProcessName: 'proc',
          PollStatus: 'ACTIVE',
        }),
        buildRun({
          RunId: 'run-lab-2',
          LaboratoryId: 'lab-2',
          CurrentProcessName: 'proc',
          PollStatus: 'ACTIVE',
        }),
      ];

      const { updateWithAttributeRemoval } = await runScript(['--lab', 'lab-1'], runs);

      expect(updateWithAttributeRemoval).toHaveBeenCalledTimes(1);
      expect(updateWithAttributeRemoval.mock.calls[0][0].RunId).toBe('run-lab-1');
    });
  });

  describe('Pass 2 - PollStatus backfill', () => {
    it('patches non-terminal runs missing PollStatus and skips runs that already have it', async () => {
      const runs = [
        buildRun({ RunId: 'run-missing', Status: 'RUNNING' }),
        buildRun({ RunId: 'run-already-active', Status: 'RUNNING', PollStatus: 'ACTIVE' }),
        buildRun({ RunId: 'run-pending', Status: 'PENDING' }),
      ];

      const { update, updateWithAttributeRemoval } = await runScript([], runs);

      expect(updateWithAttributeRemoval).not.toHaveBeenCalled();
      expect(update).toHaveBeenCalledTimes(2);
      const patchedRunIds = update.mock.calls.map(([run]) => run.RunId);
      expect(patchedRunIds).toEqual(expect.arrayContaining(['run-missing', 'run-pending']));
      expect(update.mock.calls.every(([run]) => run.PollStatus === 'ACTIVE')).toBe(true);
      expect(exitSpy).not.toHaveBeenCalled();
    });

    it('only patches runs in the laboratory given via --lab', async () => {
      const runs = [
        buildRun({ RunId: 'run-lab-1', LaboratoryId: 'lab-1', Status: 'RUNNING' }),
        buildRun({ RunId: 'run-lab-2', LaboratoryId: 'lab-2', Status: 'RUNNING' }),
      ];

      const { update } = await runScript(['--lab', 'lab-1'], runs);

      expect(update).toHaveBeenCalledTimes(1);
      expect(update.mock.calls[0][0].RunId).toBe('run-lab-1');
    });

    it('strips CurrentProcessName from the SET payload when both passes apply', async () => {
      const runs = [buildRun({ RunId: 'run-both', Status: 'RUNNING', CurrentProcessName: 'proc' })];

      const { update, updateWithAttributeRemoval } = await runScript([], runs);

      expect(updateWithAttributeRemoval).toHaveBeenCalledTimes(1);
      expect(update).toHaveBeenCalledTimes(1);
      expect(update.mock.calls[0][0]).not.toHaveProperty('CurrentProcessName');
      expect(update.mock.calls[0][0].PollStatus).toBe('ACTIVE');
    });
  });

  describe('Pass 3 - NotifiedAt backfill', () => {
    it('patches terminal runs missing NotifiedAt and skips runs that already have it or are non-terminal', async () => {
      const runs = [
        buildRun({ RunId: 'run-completed', Status: 'COMPLETED', ModifiedAt: '2024-06-01T00:00:00.000Z' }),
        buildRun({ RunId: 'run-already-notified', Status: 'COMPLETED', NotifiedAt: '2024-03-03T00:00:00.000Z' }),
        // PollStatus already set so Pass 2 (PollStatus backfill) also skips this run — this
        // test only asserts Pass 3 (NotifiedAt) behavior, and all passes run per invocation.
        buildRun({ RunId: 'run-running', Status: 'RUNNING', PollStatus: 'ACTIVE' }),
      ];

      const { update } = await runScript([], runs);

      expect(update).toHaveBeenCalledTimes(1);
      expect(update.mock.calls[0][0]).toMatchObject({
        RunId: 'run-completed',
        NotifiedAt: '2024-06-01T00:00:00.000Z',
      });
    });

    it('prefers ModifiedAt over CreatedAt, and falls back to now() when both are missing', async () => {
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-07-31T12:00:00.000Z');

      const runs = [
        buildRun({
          RunId: 'run-both-timestamps',
          Status: 'COMPLETED',
          CreatedAt: '2024-01-01T00:00:00.000Z',
          ModifiedAt: '2024-06-01T00:00:00.000Z',
        }),
        buildRun({ RunId: 'run-created-only', Status: 'FAILED', CreatedAt: '2024-02-02T00:00:00.000Z' }),
        buildRun({ RunId: 'run-neither-timestamp', Status: 'CANCELLED' }),
      ];

      const { update } = await runScript([], runs);

      const notifiedAtByRunId = new Map(update.mock.calls.map(([run]) => [run.RunId, run.NotifiedAt]));
      expect(notifiedAtByRunId.get('run-both-timestamps')).toBe('2024-06-01T00:00:00.000Z');
      expect(notifiedAtByRunId.get('run-created-only')).toBe('2024-02-02T00:00:00.000Z');
      expect(notifiedAtByRunId.get('run-neither-timestamp')).toBe('2026-07-31T12:00:00.000Z');
    });

    it('only patches runs in the laboratory given via --lab', async () => {
      const runs = [
        buildRun({ RunId: 'run-lab-1', LaboratoryId: 'lab-1', Status: 'COMPLETED' }),
        buildRun({ RunId: 'run-lab-2', LaboratoryId: 'lab-2', Status: 'COMPLETED' }),
      ];

      const { update } = await runScript(['--lab', 'lab-2'], runs);

      expect(update).toHaveBeenCalledTimes(1);
      expect(update.mock.calls[0][0].RunId).toBe('run-lab-2');
    });
  });

  describe('--dry-run', () => {
    it('performs no writes for any pass', async () => {
      const runs = [
        buildRun({ RunId: 'run-legacy', CurrentProcessName: 'proc', PollStatus: 'ACTIVE' }),
        buildRun({ RunId: 'run-poll-candidate', Status: 'RUNNING' }),
        buildRun({ RunId: 'run-notified-candidate', Status: 'COMPLETED' }),
      ];

      const { update, updateWithAttributeRemoval } = await runScript(['--dry-run'], runs);

      expect(update).not.toHaveBeenCalled();
      expect(updateWithAttributeRemoval).not.toHaveBeenCalled();
      expect(exitSpy).not.toHaveBeenCalled();
    });
  });

  describe('exit behavior', () => {
    it('exits with code 1 but still attempts remaining runs when a CurrentProcessName update fails', async () => {
      const runs = [
        buildRun({ RunId: 'run-fail', CurrentProcessName: 'proc', PollStatus: 'ACTIVE' }),
        buildRun({ RunId: 'run-ok', CurrentProcessName: 'proc', PollStatus: 'ACTIVE' }),
      ];

      const { updateWithAttributeRemoval } = await runScript(
        [],
        runs,
        async (run) => run,
        async (run) => {
          if (run.RunId === 'run-fail') throw new Error('ddb write failed');
          return run;
        },
      );

      expect(updateWithAttributeRemoval).toHaveBeenCalledTimes(2);
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('exits with code 1 but still attempts remaining runs when a PollStatus update fails', async () => {
      const runs = [
        buildRun({ RunId: 'run-fail', Status: 'RUNNING' }),
        buildRun({ RunId: 'run-ok', Status: 'PENDING' }),
      ];

      const { update } = await runScript([], runs, async (run) => {
        if (run.RunId === 'run-fail') throw new Error('ddb write failed');
        return run;
      });

      expect(update).toHaveBeenCalledTimes(2);
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('exits with code 1 when a NotifiedAt update fails', async () => {
      const runs = [
        buildRun({ RunId: 'run-fail', Status: 'COMPLETED' }),
        buildRun({ RunId: 'run-ok', Status: 'FAILED' }),
      ];

      const { update } = await runScript([], runs, async (run) => {
        if (run.RunId === 'run-fail') throw new Error('ddb write failed');
        return run;
      });

      expect(update).toHaveBeenCalledTimes(2);
      expect(exitSpy).toHaveBeenCalledWith(1);
    });

    it('does not call process.exit when every candidate is patched successfully', async () => {
      const runs = [
        buildRun({ RunId: 'run-legacy', CurrentProcessName: 'proc', PollStatus: 'ACTIVE' }),
        buildRun({ RunId: 'run-poll', Status: 'RUNNING' }),
        buildRun({ RunId: 'run-notified', Status: 'COMPLETED' }),
      ];

      await runScript([], runs);

      expect(exitSpy).not.toHaveBeenCalled();
    });
  });
});
