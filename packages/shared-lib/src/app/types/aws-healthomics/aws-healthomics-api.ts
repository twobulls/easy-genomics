import { GetRunResponse, GetWorkflowResponse, ListWorkflowsResponse, ListRunsResponse } from '@aws-sdk/client-omics';

export type ListWorkflows = ListWorkflowsResponse;

export type ReadWorkflow = GetWorkflowResponse;

export type ListRuns = ListRunsResponse;

export type ReadRun = GetRunResponse;
