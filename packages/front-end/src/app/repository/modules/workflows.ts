import {
  CreateWorkflowLaunchRequest,
  ListWorkflowsResponse,
  DescribeWorkflowResponse,
} from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
// import { DescribeWorkflowResponse as DescribeWorkflowResponseSchema } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-zod-schemas.client';
import HttpFactory from '../factory';
// import { validateApiResponse } from '~/utils/api-utils';

class PipelinesModule extends HttpFactory {
  async createPipelineRun(labId: string, pipelineLaunchRequest: CreateWorkflowLaunchRequest): Promise<any> {
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

  async readWorkflow(workflowId: string, labId: string): Promise<DescribeWorkflowResponse[]> {
    const res = await this.callNextflowTower<DescribeWorkflowResponse[]>(
      'GET',
      `/workflow/read-workflow/${workflowId}/?laboratoryId=${labId}`,
    );

    if (!res) {
      throw new Error('Failed to retrieve workflows');
    }

    // TODO
    // validateApiResponse(DescribeWorkflowResponseSchema, res);
    return res;
  }
}

export default PipelinesModule;
