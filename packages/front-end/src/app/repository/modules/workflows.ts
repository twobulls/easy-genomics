import {
  CreateWorkflowLaunchRequest,
  ListWorkflowsResponse,
} from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';

class PipelinesModule extends HttpFactory {
  $config = useRuntimeConfig();

  async createPipelineRun(labId: string, pipelineLaunchRequest: CreateWorkflowLaunchRequest): Promise<any> {
    console.log('Creating pipeline run POST with pipelineLaunchRequest:', pipelineLaunchRequest);

    const res = await this.callNextflowTower<any>(
      'POST',
      `/workflow/create-workflow-execution?laboratoryId=${labId}`,
      pipelineLaunchRequest,
    );

    if (!res) {
      console.error('Error calling create pipeline run API');
      throw new Error('Failed to create pipeline run');
    }

    return res;
  }

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

  // TODO: add Zod response validation
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
