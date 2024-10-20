import { FileDownloadResponseSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/files/request-file-download';
import {
  RequestFileDownload,
  FileDownloadResponse,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/files/request-file-download';
import {
  CreateWorkflowLaunchRequest,
  ListWorkflowsResponse,
  DescribeWorkflowResponse,
  Workflow,
} from '@easy-genomics/shared-lib/src/app/types/nf-tower/nextflow-tower-api';
import HttpFactory from '@FE/repository/factory';
import { validateApiResponse } from '@FE/utils/api-utils';

class WorkflowsModule extends HttpFactory {
  async createPipelineRun(labId: string, pipelineLaunchRequest: CreateWorkflowLaunchRequest): Promise<any> {
    const res = await this.callNextflowTower<any>(
      'POST',
      `/workflow/create-workflow-execution?laboratoryId=${labId}`,
      pipelineLaunchRequest,
    );
    console.log('createPipelineRun response:', res);
    if (!res) {
      console.error('Error calling create pipeline run API');
      throw new Error('Failed to create pipeline run');
    }
    return res;
  }

  async list(labId: string): Promise<Workflow[]> {
    const res = await this.callNextflowTower<ListWorkflowsResponse>(
      'GET',
      `/workflow/list-workflows?laboratoryId=${labId}`,
    );
    if (!res) {
      throw new Error('Failed to retrieve workflows');
    }

    // wfMeta.workflow is a WorkflowDbDto object, but we want a Workflow
    // their schemas are not idential but they are close, so for now we're coercing them and hoping for the best
    const workflows = res.workflows?.map((wfMeta) => wfMeta.workflow as Workflow);

    return workflows || [];
  }

  async cancelPipelineRun(labId: string, workflowId: string): Promise<any> {
    const res = await this.callNextflowTower<any>(
      'PUT',
      `/workflow/cancel-workflow-execution/${workflowId}?laboratoryId=${labId}`,
    );

    if (!res) {
      console.error('Error calling cancel pipeline run API');
      throw new Error('Failed to cancel pipeline run');
    }
    return res;
  }

  async readWorkflowReports(workspaceId: string, labId: string): Promise<any> {
    const res = await this.callNextflowTower<any>(
      'GET',
      `/workflow/read-workflow-reports/${workspaceId}?laboratoryId=${labId}`,
    );
    if (!res) {
      console.error('Error calling read workflow reports API');
      throw new Error('Failed to read workflow reports');
    }
    return res;
  }

  async downloadReport(labId: string, filePath: string): Promise<FileDownloadResponse> {
    const res = await this.call<RequestFileDownload>('POST', '/files/request-file-download', {
      LaboratoryId: labId,
      Path: filePath,
    });

    if (!res) {
      console.error('Error calling download report API');
      throw new Error('Failed to download report');
    }

    validateApiResponse(FileDownloadResponseSchema, res);

    return res;
  }

  async get(labId: string, workflowId: string): Promise<Workflow> {
    const res = await this.callNextflowTower<DescribeWorkflowResponse>(
      'GET',
      `/workflow/read-workflow/${workflowId}?laboratoryId=${labId}`,
    );

    if (!res) {
      console.error('Error calling get pipeline run API');
      throw new Error('Failed to get pipeline run');
    }

    // as noted in list(...), coercing to get the right type back
    return res.workflow as Workflow;
  }
}

export default WorkflowsModule;
