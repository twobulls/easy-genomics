import { ListPipelinesQuery } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';

class PipelinesModule extends HttpFactory {
  $config = useRuntimeConfig();

  // FIXME: return type not correct.. ?
  async list(labId: string): Promise<ListPipelinesQuery[]> {
    const res = await this.callNfTower<ListPipelinesQuery[]>('GET', `/pipeline/list-pipelines?laboratoryId=${labId}`);

    if (!res) {
      console.error('Error calling list pipeline API');
      throw new Error('Failed to retrieve pipelines');
    }

    return res;
  }
}

export default PipelinesModule;
