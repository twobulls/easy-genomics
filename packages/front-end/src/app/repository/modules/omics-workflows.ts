import {
  ListWorkflows,
  ReadWorkflow,
} from '@easy-genomics/shared-lib/src/app/types/aws-healthomics/aws-healthomics-api';
import HttpFactory from '@FE/repository/factory';

class OmicsWorkflowsModule extends HttpFactory {
  async list(labId: string): Promise<ListWorkflows> {
    const res = await this.callOmics<ListWorkflows>('GET', `/workflow/list-private-workflows?laboratoryId=${labId}`);

    if (!res) {
      throw new Error('Failed to retrieve omics workflows details');
    }

    return res;
  }

  async get(labId: string, workflowId: string): Promise<ReadWorkflow> {
    const res = await this.callOmics<ReadWorkflow>(
      'GET',
      `/workflow/read-private-workflow/${workflowId}?laboratoryId=${labId}`,
    );

    if (!res) {
      throw new Error('Failed to retrieve omics workflow details');
    }

    return res;
  }
}

export default OmicsWorkflowsModule;
