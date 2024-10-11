import { defineStore } from 'pinia';
import { z } from 'zod';

export const pipelineRunStateSchema = z.object({
  labId: z.string(),
  labName: z.string(),
  pipelineId: z.number(),
  pipelineName: z.string(),
  pipelineDescription: z.string(),
  transactionId: z.string(),
  userPipelineRunName: z.string(),
  params: z.object({}),
  sampleSheetCsv: z.string(),
  sampleSheetS3Url: z.string(),
  s3Bucket: z.string(),
  s3Path: z.string(),
});
export type PipeLineRunState = z.infer<typeof pipelineRunStateSchema>;

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
  sampleSheetS3Url: '',
  s3Bucket: '',
  s3Path: '',
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

    setSampleSheetS3Url(path: string) {
      this.sampleSheetS3Url = path;
    },

    setS3Bucket(bucket: string) {
      this.s3Bucket = bucket;
    },

    setS3Path(path: string) {
      this.s3Path = path;
    },

    reset() {
      Object.assign(this, initialState());
    },
  },

  persist: true,
});

export default usePipelineRunStore;
