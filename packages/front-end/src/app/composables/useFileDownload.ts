import { FileDownloadResponse } from '@/packages/shared-lib/src/app/types/nf-tower/file/request-file-download';

export default function useFileDownload() {
  const { $api } = useNuxtApp();

  async function downloadReport(labId: string, fileName: string, path: string, size: number) {
    const fileDownload: FileDownloadResponse = await $api.workflows.getNextFlowFileDownload(labId, path);
    if (fileDownload) {
      const link = document.createElement('a');
      link.href = `data:${size};base64,${fileDownload.Data}`;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }

  return {
    downloadReport,
  };
}
