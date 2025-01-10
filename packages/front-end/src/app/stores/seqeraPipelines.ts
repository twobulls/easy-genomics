import { Pipeline as SeqeraPipeline } from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import { defineStore } from 'pinia';

interface SeqeraPipelinesStoreState {
  // indexed by pipeline id
  pipelines: Record<string, SeqeraPipeline>;
  // ordered lists for pipelines by lab
  pipelineIdsByLab: Record<string, number[]>;
}

const initialState = (): SeqeraPipelinesStoreState => ({
  pipelines: {},
  pipelineIdsByLab: {},
});

const useSeqeraPipelinesStore = defineStore('seqeraPipelinesStore', {
  state: initialState,

  getters: {
    pipelinesForLab:
      (state: SeqeraPipelinesStoreState) =>
      (labId: string): SeqeraPipeline[] =>
        state.pipelineIdsByLab[labId]?.map((pipelineId) => state.pipelines[pipelineId]) || [],
  },

  actions: {
    reset() {
      Object.assign(this, initialState());
    },

    async loadPipelinesForLab(labId: string): Promise<void> {
      const { $api } = useNuxtApp();

      const res = await $api.seqeraPipelines.list(labId);

      if (!res.pipelines) {
        throw new Error('list seqera pipelines response did not contain data');
      }

      this.pipelineIdsByLab[labId] = [];

      for (const pipeline of res.pipelines) {
        this.pipelines[pipeline.pipelineId!] = pipeline;
        this.pipelineIdsByLab[labId].push(pipeline.pipelineId!);
      }
    },
  },

  persist: true,
});

export default useSeqeraPipelinesStore;
