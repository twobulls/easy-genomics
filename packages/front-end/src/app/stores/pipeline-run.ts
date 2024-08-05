import { defineStore } from 'pinia';
import { z } from 'zod';

export const pipelineRunStateSchema = z.object({
  labId: z.string(),
  labName: z.string(),
  pipelineId: z.number(),
  pipelineName: z.string(),
  pipelineDescription: z.string(),
  userPipelineRunName: z.string(),
  params: z.object({}),
  sampleSheetCsv: z.string(),
  // s3 path of uploaded file
  // csv file
  // org
  // lab
  // user
  // date and time?
  // pipeline default parameters
  // run parameters
});
export type PipeLineRunState = z.infer<typeof pipelineRunStateSchema>;

const initialState = (): PipeLineRunState => ({
  labId: '',
  labName: '',
  pipelineId: 0,
  pipelineName: '',
  pipelineDescription: '',
  userPipelineRunName: '',
  params: {},
  sampleSheetCsv: '',
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

    setUserPipelineRunName(userPipelineRunName: string) {
      this.userPipelineRunName = userPipelineRunName;
    },

    setParams(params: object) {
      this.params = params;
    },

    setSampleSheetCsv(sampleSheetCsv: string) {
      this.sampleSheetCsv = sampleSheetCsv;
    },

    reset() {
      Object.assign(this, initialState());
    },
  },

  persist: true,
});

export default usePipelineRunStore;
