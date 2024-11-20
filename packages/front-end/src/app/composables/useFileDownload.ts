import { FileDownloadResponse } from '@/packages/shared-lib/src/app/types/nf-tower/file/request-file-download';

export default function useFileDownload() {
  const { $api } = useNuxtApp();

  async function downloadReport(labId: string, fileName: string, path: string, size: number) {
    const fileDownload: FileDownloadResponse = await $api.workflows.getNextFlowFileDownload(labId, path);
    // const fileDownload: FileDownloadResponse = await $api.workflows.getNextFlowFileDownload(labId, path + fileName);
    if (fileDownload) {
      const link = document.createElement('a');
      link.href = `data:${size};base64,${fileDownload.Data}`;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }

  async function downloadFolder() {
    // TODO
  }

  function isSupportedFileType(filename: string): boolean {
    const supportedExtensions = ['.csv', '.txt'];
    const extensionIndex = filename.lastIndexOf('.');

    if (extensionIndex === -1) {
      return false; // No extension found
    }

    const extension = filename.slice(extensionIndex).toLowerCase();
    return supportedExtensions.includes(extension);
  }

  async function openFileInNewWindow(labId: string, path: string, mimeType: string) {
    const fileDownload: FileDownloadResponse = await $api.workflows.getNextFlowFileDownload(labId, path);
    if (fileDownload) {
      const fileContent = `data:${mimeType};base64,${fileDownload.Data}`;
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.body.innerHTML = `<iframe src="${fileContent}" width="100%" height="100%"></iframe>`;
      }
    }
  }

  return {
    downloadReport,
    downloadFolder,
    openFileInNewWindow,
    isSupportedFileType,
  };
}
