import {
  FileDownloadUrlResponse,
  RequestFileDownloadUrl,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/file/request-file-download-url';
import { useWorkflowStore } from '@FE/stores';
import { WipWorkflowData } from '@FE/stores/workflow';

export default function usePipeline($api: any) {
  /**
   * Downloads the sample sheet as a CSV file.
   */
  async function downloadSampleSheet(workflowTempId: string) {
    const wipWorkflow: WipWorkflowData = useWorkflowStore().wipWorkflows[workflowTempId];

    const req: RequestFileDownloadUrl = {
      LaboratoryId: `${wipWorkflow.laboratoryId}`,
      S3Uri: `${wipWorkflow.sampleSheetS3Url}`,
    };
    const fileDownloadUrlResponse: FileDownloadUrlResponse = await $api.files.requestFileDownloadUrl(req);
    const link = document.createElement('a');
    link.setAttribute('href', fileDownloadUrlResponse.DownloadUrl);
    link.setAttribute('download', `samplesheet-${wipWorkflow.pipelineName}--${wipWorkflow.userPipelineRunName}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Checks if the property format is 'file-path'; currently used as a helper
   * to hide this special-case for all occurences in the UI except for the S3 bucket input path
   *
   * @format property
   */
  function isParamsFormatFilePath(format: string) {
    return format === 'file-path';
  }

  return {
    downloadSampleSheet,
    isParamsFormatFilePath,
  };
}
