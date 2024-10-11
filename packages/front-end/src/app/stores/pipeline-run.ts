import { defineStore } from 'pinia';

interface PipeLineRunState {
  //
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
  },

  persist: true,
});

export default usePipelineRunStore;
