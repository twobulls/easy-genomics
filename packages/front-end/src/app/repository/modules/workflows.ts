import {
  CreateWorkflowLaunchRequest,
  ListWorkflowsResponse,
} from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';

// TODO: replace return types with Zod schemas generated from Nextflow Tower's OpenAPI schema

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
      console.error('Error calling list workflows API');
      throw new Error('Failed to retrieve workflows');
    }

    return res;
  }

  async readWorkflow(workspaceId: string, labId: string): Promise<ListWorkflowsResponse[]> {
    const res = await this.callNextflowTower<ListWorkflowsResponse[]>(
      'GET',
      `/workflow/read-workflow/${workspaceId}?laboratoryId=${labId}`,
    );

    if (!res) {
      console.error('Error calling read workflow API');
      throw new Error('Failed to retrieve workflow');
    }

    return res;
  }
}

export default PipelinesModule;
