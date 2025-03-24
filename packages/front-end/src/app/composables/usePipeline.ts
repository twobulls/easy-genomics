export default function usePipeline($api: any) {
  /**
   * Downloads the sample sheet as a CSV file.
   */
  async function downloadSampleSheet(labId: string, sampleSheetS3Url: string) {
    const fileDownloadUrlResponse = await $api.file.requestFileDownloadUrl({
      LaboratoryId: labId,
      S3Uri: sampleSheetS3Url,
    });
    const sampleSheetCsvData = await (await fetch(fileDownloadUrlResponse.DownloadUrl)).text();
    const downloadFileName = `${sampleSheetS3Url}`.split('#')[0].split('?')[0].split('/').pop();
    const link = document.createElement('a');
    link.href = `data:text/csv;charset=utf-8,${sampleSheetCsvData}`;
    link.style.visibility = 'hidden';
    link.download = downloadFileName;
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
