import { FileDownloadUrlResponseSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/file/request-file-download-url';
import { FileDownloadResponseSchema } from '@easy-genomics/shared-lib/src/app/schema/nf-tower/file/request-file-download';
import { FileDownloadUrlResponse } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/file/request-file-download-url';
import { FileDownloadResponse } from '@easy-genomics/shared-lib/src/app/types/nf-tower/file/request-file-download';
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

  /**
   * Calls '/easy-genomics/file/download/request-file-download-url' API to
   * retrieve pre-signed S3 Download URL for secure file download.
   *
   * This method and API is only suitable for us when downloading a file that
   * exists within an S3 Bucket that the AWS Account has access to and is within
   * the same AWS Region.
   *
   * @param labId
   * @param s3Uri
   */
  async getFileDownloadUrl(labId: string, s3Uri: string): Promise<FileDownloadUrlResponse> {
    const res = await this.call<FileDownloadUrlResponse>('POST', '/file/download/request-file-download-url', {
      LaboratoryId: labId,
      S3Uri: s3Uri,
    });

    if (!res) {
      console.error('Error calling file download url API');
      throw new Error('Failed to get file download url');
    }

    validateApiResponse(FileDownloadUrlResponseSchema, res);
    return res;
  }

  /**
   * Calls '/nf-tower/file/request-file-download' API to download the contents
   * of a specified NextFlow Tower Workflow Run results file.
   *
   * @param labId
   * @param contentUri
   */
  async getNextFlowFileDownload(labId: string, contentUri: string): Promise<FileDownloadResponse> {
    const res: FileDownloadResponse | undefined = await this.callNextflowTower<FileDownloadResponse>(
      'POST',
      '/file/request-file-download',
      {
        LaboratoryId: labId,
        ContentUri: contentUri,
      },
    );

    if (!res) {
      console.error('Error calling file download API');
      throw new Error('Failed to perform file download');
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
