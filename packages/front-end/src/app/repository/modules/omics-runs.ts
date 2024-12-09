import { ListRuns, ReadRun } from '@easy-genomics/shared-lib/src/app/types/aws-healthomics/aws-healthomics-api';
import HttpFactory from '@FE/repository/factory';

class OmicsRunsModule extends HttpFactory {
  async list(labId: string): Promise<ListRuns> {
    const res = await this.callOmics<ListRuns>('GET', `/run/list-runs?laboratoryId=${labId}`);

    if (!res) {
      throw new Error('Failed to retrieve omics runs details');
    }

    return res;
  }

  async get(labId: string, runId: string): Promise<ReadRun> {
    const res = await this.callOmics<ReadRun>('GET', `/workflow/read-private-workflow/${runId}?laboratoryId=${labId}`);

    if (!res) {
      throw new Error('Failed to retrieve omics run details');
    }

    return res;
  }
}

export default OmicsRunsModule;
