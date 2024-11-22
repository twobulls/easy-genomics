import { useRunStore } from '@FE/stores';
import { WipNextFlowRunData } from '@FE/stores/run';

export default function usePipeline($api: any) {
  /**
   * Downloads the sample sheet as a CSV file.
   */
  async function downloadSampleSheet(nextFlowRunTempId: string) {
    const wipWorkflow: WipNextFlowRunData = useRunStore().wipNextFlowRuns[nextFlowRunTempId];

    const fileDownloadUrlResponse = await $api.files.requestFileDownloadUrl({
      LaboratoryId: `${wipWorkflow.laboratoryId}`,
      S3Uri: `${wipWorkflow.sampleSheetS3Url}`,
    });
    const sampleSheetCsvData = await (await fetch(fileDownloadUrlResponse.DownloadUrl)).text();
    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${sampleSheetCsvData}`;
    link.download = `samplesheet-${wipWorkflow.pipelineName}--${wipWorkflow.userPipelineRunName}.csv`;
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
