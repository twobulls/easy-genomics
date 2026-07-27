import { aggregateSeqeraProgress } from '../../../src/app/utils/seqera-run-progress-utils';
import { ProgressData } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';

describe('aggregateSeqeraProgress', () => {
  it('returns undefined when workflowProgress is missing', () => {
    expect(aggregateSeqeraProgress(undefined)).toBeUndefined();
    expect(aggregateSeqeraProgress({})).toBeUndefined();
  });

  it('maps workflowProgress counts and percent', () => {
    const progress: ProgressData = {
      workflowProgress: {
        pending: 2,
        submitted: 1,
        running: 3,
        succeeded: 10,
        failed: 1,
        cached: 2,
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
    };

    // total = 2+1+3+10+1+2 = 19; completed = 10+2 = 12; percent = 63
    expect(aggregateSeqeraProgress(progress)).toEqual({
      tasksTotal: 19,
      tasksCompleted: 12,
      tasksRunning: 3,
      tasksFailed: 1,
      percent: 63,
    });
  });

  it('returns the first process with running > 0 as currentProcessName', () => {
    const progress: ProgressData = {
      workflowProgress: {
        pending: 0,
        submitted: 0,
        running: 2,
        succeeded: 1,
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
          process: 'FASTQC',
          pending: 0,
          submitted: 0,
          running: 0,
          succeeded: 1,
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
        {
          process: 'SAMTOOLS_SORT',
          pending: 0,
          submitted: 0,
          running: 1,
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
    };

    expect(aggregateSeqeraProgress(progress)?.currentProcessName).toBe('BOWTIE2_ALIGN');
  });

  it('omits currentProcessName when no processes are running', () => {
    const progress: ProgressData = {
      workflowProgress: {
        pending: 1,
        submitted: 0,
        running: 0,
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
          process: 'FASTQC',
          pending: 0,
          submitted: 0,
          running: 0,
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
      ],
    };

    expect(aggregateSeqeraProgress(progress)?.currentProcessName).toBeUndefined();
  });
});
