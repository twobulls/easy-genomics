import {
  DescribePipelineLaunchResponse,
  ListPipelinesResponse,
} from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';
// import { validateApiResponse } from '~/utils/api-utils';

class PipelinesModule extends HttpFactory {
  $config = useRuntimeConfig();

  async readPipelineLaunchDetails(labId: string, pipelineId: string): Promise<DescribePipelineLaunchResponse> {
    const res = await this.callNextflowTower<DescribePipelineLaunchResponse>(
      'GET',
      `/pipeline/read-pipeline-launch-details/${pipelineId}?laboratoryId=${labId}`,
    );

    console.log('Read pipeline launch details response:', res);
    if (!res) {
      console.error('Error calling read pipeline launch details API');
      throw new Error('Failed to retrieve pipeline launch details');
    }

    return res;
  }

  async list(labId: string): Promise<ListPipelinesResponse[]> {
    const res = await this.callNextflowTower<ListPipelinesResponse[]>(
      'GET',
      `/pipeline/list-pipelines?laboratoryId=${labId}`,
    );

    if (!res) {
      console.error('Error calling list pipeline API');
      throw new Error('Failed to retrieve pipelines');
    }

    // validateApiResponse(ListPipelinesResponseSchema, res);
    return res;
  }
}

export default PipelinesModule;
