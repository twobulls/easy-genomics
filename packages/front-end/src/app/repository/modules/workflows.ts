import { ListWorkflowsResponse } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';

class PipelinesModule extends HttpFactory {
  $config = useRuntimeConfig();

  async list(labId: string): Promise<ListWorkflowsResponse[]> {
    const res = await this.callNextflowTower<ListWorkflowsResponse[]>(
      'GET',
      `/workflow/list-workflows?laboratoryId=${labId}`,
    );

    if (!res) {
      throw new Error('Failed to retrieve workflows');
    }

    return res;
  }

  // TODO: Add Zod schema validation
  async createWorkflow(labId: string, runName: string, launchDetails: any): Promise<ListWorkflowsResponse[]> {
    const res = await this.callNextflowTower<ListWorkflowsResponse[]>(
      'POST',
      `/workflow/create-workflow-execution?laboratoryId=${labId}`,

      {
        userRunName: runName,
        pipelineLaunchDetails: { ...launchDetails },
      },
    );

    if (!res) {
      throw new Error('Failed to retrieve workflows');
    }

    return res;
  }
}

export default PipelinesModule;
