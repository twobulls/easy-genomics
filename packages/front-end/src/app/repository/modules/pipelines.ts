import { ListPipelinesResponse } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';

class PipelinesModule extends HttpFactory {
  $config = useRuntimeConfig();

  // TODO: replace return types with Zod schemas generated from Nextflow Tower's OpenAPI schema
  async list(labId: string): Promise<ListPipelinesResponse[]> {
    const res = await this.callNextflowTower<ListPipelinesResponse[]>(
      'GET',
      `/pipeline/list-pipelines?laboratoryId=${labId}`,
    );

    if (!res) {
      console.error('Error calling list pipeline API');
      throw new Error('Failed to retrieve pipelines');
    }

    return res;
  }
}

export default PipelinesModule;
