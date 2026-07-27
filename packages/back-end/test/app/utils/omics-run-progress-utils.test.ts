import { TaskListItem } from '@aws-sdk/client-omics';
import { aggregateTaskProgress } from '../../../src/app/utils/omics-run-progress-utils';

describe('aggregateTaskProgress', () => {
  it('returns zeros for an empty task list', () => {
    expect(aggregateTaskProgress([])).toEqual({
      tasksTotal: 0,
      tasksCompleted: 0,
      tasksRunning: 0,
      tasksFailed: 0,
      percent: 0,
    });
  });

  it('aggregates completed, running, and failed task counts', () => {
    const items: TaskListItem[] = [
      { taskId: '1', status: 'COMPLETED' },
      { taskId: '2', status: 'COMPLETED' },
      { taskId: '3', status: 'RUNNING' },
      { taskId: '4', status: 'STARTING' },
      { taskId: '5', status: 'FAILED' },
      { taskId: '6', status: 'PENDING' },
    ];

    expect(aggregateTaskProgress(items)).toEqual({
      tasksTotal: 6,
      tasksCompleted: 2,
      tasksRunning: 2,
      tasksFailed: 1,
      percent: 33,
    });
  });

  it('rounds percent from completed over total known tasks', () => {
    const items: TaskListItem[] = [
      { taskId: '1', status: 'COMPLETED' },
      { taskId: '2', status: 'RUNNING' },
      { taskId: '3', status: 'PENDING' },
    ];

    expect(aggregateTaskProgress(items).percent).toBe(33);
  });

  it('returns the first RUNNING or STARTING task name as currentProcessName', () => {
    const items: TaskListItem[] = [
      { taskId: '1', status: 'COMPLETED', name: 'FASTQC' },
      { taskId: '2', status: 'RUNNING', name: 'BOWTIE2_ALIGN' },
      { taskId: '3', status: 'STARTING', name: 'SAMTOOLS_SORT' },
      { taskId: '4', status: 'PENDING', name: 'BCFTOOLS' },
    ];

    expect(aggregateTaskProgress(items).currentProcessName).toBe('BOWTIE2_ALIGN');
  });

  it('skips running tasks without a name and uses the next named running task', () => {
    const items: TaskListItem[] = [
      { taskId: '1', status: 'RUNNING' },
      { taskId: '2', status: 'STARTING', name: 'SAMTOOLS_SORT' },
    ];

    expect(aggregateTaskProgress(items).currentProcessName).toBe('SAMTOOLS_SORT');
  });

  it('omits currentProcessName when no tasks are running', () => {
    const items: TaskListItem[] = [
      { taskId: '1', status: 'COMPLETED', name: 'FASTQC' },
      { taskId: '2', status: 'PENDING', name: 'BOWTIE2_ALIGN' },
    ];

    expect(aggregateTaskProgress(items).currentProcessName).toBeUndefined();
  });
});
