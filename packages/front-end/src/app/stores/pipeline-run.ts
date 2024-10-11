import { Workflow } from '@easy-genomics/shared-lib/lib/app/types/nf-tower/nextflow-tower-api';
import { defineStore } from 'pinia';

interface PipeLineRunState {
  // TODO: refactor all of these out
  labId: string;
  labName: string;
  pipelineId: number;
  pipelineName: string;
  pipelineDescription: string;
  transactionId: string;
  userPipelineRunName: string;
  params: object;
  sampleSheetCsv: string;
  S3Url: string;
  // s3 path of uploaded file
  // csv file
  // org
  // lab
  // user
  // date and time?
  // pipeline default parameters
  // run parameters

  // lookup object for pipeline runs
  pipelineRuns: Record<string, Record<string, Workflow>>;
  // ordered lists for pipelines by lab
  pipelineRunIdsOrders: Record<string, string[]>;
}

const initialState = (): PipeLineRunState => ({
  labId: '',
  labName: '',
  pipelineId: 0,
  pipelineName: '',
  pipelineDescription: '',
  transactionId: '',
  userPipelineRunName: '',
  params: {},
  sampleSheetCsv: '',
  S3Url: '',

  pipelineRuns: {},
  pipelineRunIdsOrders: {},
});

const usePipelineRunStore = defineStore('pipelineRunStore', {
  state: initialState,

  actions: {
    setLabId(labId: string) {
      this.labId = labId;
    },

    setLabName(labName: string) {
      this.labName = labName;
    },

    setPipelineId(pipelineId: number) {
      this.pipelineId = pipelineId;
    },

    setPipelineName(pipelineName: string) {
      this.pipelineName = pipelineName;
    },

    setPipelineDescription(pipelineDescription: string) {
      this.pipelineDescription = pipelineDescription;
    },

    setTransactionId(transactionId: string) {
      this.transactionId = transactionId;
    },

    setUserPipelineRunName(userPipelineRunName: string) {
      this.userPipelineRunName = userPipelineRunName;
    },

    setParams(params: object) {
      this.params = params;
    },

    setSampleSheetCsv(sampleSheetCsv: string) {
      this.sampleSheetCsv = sampleSheetCsv;
    },

    setS3Url(path: string) {
      this.S3Url = path;
    },

    reset() {
      Object.assign(this, initialState());
    },

    async loadPipelineRunsForLab(labId: string): Promise<void> {
      const { $api } = useNuxtApp();

      this.pipelineRuns[labId] = {};
      this.pipelineRunIdsOrders[labId] = [];

      const pipelines = await $api.workflows.list(labId);

      for (const pipeline of pipelines) {
        if (pipeline.id !== undefined) {
          this.pipelineRuns[labId][pipeline.id] = pipeline;
          this.pipelineRunIdsOrders[labId].push(pipeline.id);
        }
      }
    },

    getPipelineRunsForLab(labId: string): Workflow[] {
      return this.pipelineRunIdsOrders[labId]?.map((pipelineId) => this.pipelineRuns[labId][pipelineId]) || [];
    },
  },

  persist: true,
});

export default usePipelineRunStore;
