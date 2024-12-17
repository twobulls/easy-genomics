import {
  DescribePipelineLaunchResponse,
  ListPipelinesResponse,
  DescribePipelineSchemaResponse,
} from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import {
  ListPipelinesResponse as ListPipelinesResponseSchema,
  PipelineSchemaResponse as PipelineSchemaResponseSchema,
} from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-zod-schemas.client';
import HttpFactory from '@FE/repository/factory';
import { validateApiResponse, stripNullProperties } from '@FE/utils/api-utils';

class SeqeraPipelinesModule extends HttpFactory {
  async list(labId: string): Promise<ListPipelinesResponse> {
    const res = await this.callSeqera<ListPipelinesResponse>('GET', `/pipeline/list-pipelines?laboratoryId=${labId}`);

    if (!res) {
      throw new Error('Failed to retrieve pipeline launch details');
    }

    const cleanedPipelines = stripNullProperties(res?.pipelines || []);
    const cleanedRes = { ...res, pipelines: cleanedPipelines };

    validateApiResponse(ListPipelinesResponseSchema, cleanedRes);
    return res;
  }

  async readPipelineLaunchDetails(pipelineId: number, labId: string): Promise<DescribePipelineLaunchResponse> {
    const res = await this.callSeqera<DescribePipelineLaunchResponse>(
      'GET',
      `/pipeline/read-pipeline-launch-details/${pipelineId}?laboratoryId=${labId}`,
    );

    if (!res) {
      throw new Error('Failed to retrieve workflow');
    }

    // TODO: add validateApiResponse()
    return res;
  }

  async readPipelineSchema(pipelineId: number, labId: string): Promise<DescribePipelineSchemaResponse> {
    const res = await this.callSeqera<DescribePipelineSchemaResponse>(
      'GET',
      `/pipeline/read-pipeline-schema/${pipelineId}?laboratoryId=${labId}`,
    );

    if (!res) {
      throw new Error('Failed to retrieve workflow');
    }

    validateApiResponse(PipelineSchemaResponseSchema, res);
    return res;
  }
}

export default SeqeraPipelinesModule;
