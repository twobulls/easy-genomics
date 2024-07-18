import { ListPipelinesResponse } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import { ListPipelinesResponse as ListPipelinesResponseSchema } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-zod-schemas.client';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';
import { validateApiResponse } from '~/utils/api-utils';

class PipelinesModule extends HttpFactory {
  $config = useRuntimeConfig();

  async list(labId: string): Promise<ListPipelinesResponse[]> {
    const res = await this.callNextflowTower<ListPipelinesResponse[]>(
      'GET',
      `/pipeline/list-pipelines?laboratoryId=${labId}`,
    );

    if (!res) {
      console.error('Error calling list pipeline API');
      throw new Error('Failed to retrieve pipelines');
    }

    validateApiResponse(ListPipelinesResponseSchema, res);
    return res;
  }
}

export default PipelinesModule;
