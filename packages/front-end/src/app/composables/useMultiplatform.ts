import { RunType } from '@easy-genomics/shared-lib/src/app/types/base-entity';

export function useMultiplatform() {
  function platformToPipelineOrWorkflow(platform: RunType): 'Pipeline' | 'Workflow' {
    switch (platform) {
      case 'Seqera Cloud':
        return 'Pipeline';
      case 'AWS HealthOmics':
        return 'Workflow';
      default:
        throw new Error(`${platform} is not a valid platform`);
    }
  }

  function platformToWipRunUpdateFunction(platform: RunType): Function {
    if (!['Seqera Cloud', 'AWS HealthOmics'].includes(platform)) {
      throw new Error(`${platform} is not a valid platform`);
    }

    const runStore = useRunStore();

    return platform === 'Seqera Cloud' ? runStore.updateWipSeqeraRun : runStore.updateWipOmicsRun;
  }

  function getWipRunForPlatform(platform: RunType, wipRunTempId: string): WipSeqeraRunData & WipOmicsRunData {
    if (!['Seqera Cloud', 'AWS HealthOmics'].includes(platform)) {
      throw new Error(`${platform} is not a valid platform`);
    }

    const runStore = useRunStore();

    const wipRunsCollection = platform === 'Seqera Cloud' ? runStore.wipSeqeraRuns : runStore.wipOmicsRuns;
    const wipRun = wipRunsCollection[wipRunTempId];

    if (!wipRun) {
      throw new Error(`no WIP ${platform} run for id ${wipRunTempId}`);
    }

    return wipRun;
  }

  return {
    platformToPipelineOrWorkflow,
    platformToWipRunUpdateFunction,
    getWipRunForPlatform,
  };
}
