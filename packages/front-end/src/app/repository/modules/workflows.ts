import { ListWorkflowsResponse } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';

class PipelinesModule extends HttpFactory {
  $config = useRuntimeConfig();

  // TODO: replace return types with Zod schemas generated from Nextflow Tower's OpenAPI schema
  async list(labId: string): Promise<ListWorkflowsResponse[]> {
    const res = await this.callNextflowTower<ListWorkflowsResponse[]>(
      'GET',
      `/workflow/read-workflow/:id?laboratoryId=${labId}`,
    );

    if (!res) {
      console.error('Error calling list workflows API');
      throw new Error('Failed to retrieve workflows');
    }

    return res;
  }
}

export default PipelinesModule;
