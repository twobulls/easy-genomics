export default function usePipeline() {
  /**
   * Downloads the sample sheet as a CSV file.
   */
  function downloadSampleSheet() {
    const csvString = usePipelineRunStore().sampleSheetCsv;
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `samplesheet-${usePipelineRunStore().pipelineName}--${usePipelineRunStore().userPipelineRunName}.csv`,
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const doesFileUrlExist = computed(() => {
    return !!(usePipelineRunStore().sampleSheetS3Url || usePipelineRunStore().params?.input);
  });

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
    doesFileUrlExist,
    downloadSampleSheet,
    isParamsFormatFilePath,
  };
}
