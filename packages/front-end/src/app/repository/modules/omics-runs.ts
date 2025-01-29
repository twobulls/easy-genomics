// eslint-disable-next-line import/named
import { StartRunCommandOutput } from '@aws-sdk/client-omics';
import { ListRuns } from '@easy-genomics/shared-lib/src/app/types/aws-healthomics/aws-healthomics-api';
import HttpFactory from '@FE/repository/factory';

class OmicsRunsModule extends HttpFactory {
  async list(labId: string): Promise<ListRuns> {
    const res = await this.callOmics<ListRuns>('GET', `/run/list-runs?laboratoryId=${labId}`);

    if (!res) {
      throw new Error('Failed to retrieve omics runs details');
    }

    return res;
  }

  async createExecution(
    labId: string,
    workflowId: string,
    name: string,
    params: object,
  ): Promise<StartRunCommandOutput> {
    const payload = {
      workflowId,
      name,
      parameters: JSON.stringify(params),
    };
    const res = await this.callOmics<StartRunCommandOutput>(
      'POST',
      `/run/create-run-execution?laboratoryId=${labId}`,
      payload,
    );

    if (!res) {
      throw new Error('Failed to start omics run');
    }

    return res;
  }
}

export default OmicsRunsModule;
