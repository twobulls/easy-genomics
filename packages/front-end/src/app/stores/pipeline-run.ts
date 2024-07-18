import { defineStore } from 'pinia';
import { z } from 'zod';

export const pipelineRunStateSchema = z.object({
  labId: z.string(),
  labName: z.string(),
  pipelineId: z.number(),
  pipelineName: z.string(),
  pipelineDescription: z.string(),
  userPipelineRunName: z.string(),
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

    reset() {
      Object.assign(this, initialState());
    },
  },

  getters: {
    getLabId(): string {
      return this.labId;
    },

    getLabName(): string {
      return this.labName;
    },

    getPipelineId(): number {
      return this.pipelineId;
    },

    getPipelineName(): string {
      return this.pipelineName;
    },

    getPipelineDescription(): string {
      return this.pipelineDescription;
    },

    getUserPipelineRunName(): string {
      return this.userPipelineRunName;
    },
  },

  persist: true,
});

export default usePipelineRunStore;
