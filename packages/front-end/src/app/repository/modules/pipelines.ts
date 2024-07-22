import {
  DescribePipelineLaunchResponse,
  ListPipelinesResponse,
} from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import { ListPipelinesResponse as ListPipelinesResponseSchema } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-zod-schemas.client';
import { useRuntimeConfig } from 'nuxt/app';
import HttpFactory from '../factory';
import { validateApiResponse, stripNullProperties } from '~/utils/api-utils';

class PipelinesModule extends HttpFactory {
  $config = useRuntimeConfig();

  async list(labId: string): Promise<ListPipelinesResponse> {
    const res = await this.callNextflowTower<ListPipelinesResponse>(
      'GET',
      `/pipeline/list-pipelines?laboratoryId=${labId}`,
    );

    if (!res) {
      throw new Error('Failed to retrieve launch details');
    }

    const cleanedPipelines = stripNullProperties(res?.pipelines || []);
    const cleanedRes = { ...res, pipelines: cleanedPipelines };

    validateApiResponse(ListPipelinesResponseSchema, cleanedRes);
    return res;
  }

  // TODO: add Zod response validation
  async readPipelineLaunchDetails(pipelineId: number, labId: string): Promise<DescribePipelineLaunchResponse> {
    const res = await this.callNextflowTower<DescribePipelineLaunchResponse>(
      'GET',
      `/pipeline/read-pipeline-launch-details/${pipelineId}?laboratoryId=${labId}`,
    );

    if (!res) {
      throw new Error('Failed to retrieve workflow');
    }

    return res;
  }
}

export default PipelinesModule;
