import { FileDownloadResponse } from '@/packages/shared-lib/src/app/types/nf-tower/file/request-file-download';

export default function useFileDownload() {
  const { $api } = useNuxtApp();

  async function handleS3Download(labId: string, fileName: string, path: string, size: number) {
    const fileDownloadPath = `${path}/${fileName}`;
    const fileDownload: FileDownloadResponse = await $api.workflows.downloadS3file(labId, fileDownloadPath);
    if (fileDownload) {
      const link = document.createElement('a');
      link.href = `data:${size};base64,${fileDownload.Data}`;
      link.download = fileName;
      link.click();
      URL.revokeObjectURL(link.href);
    }
  }

  async function downloadFolder() {
    // TODO: download folder as zip file once API is available
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
    const fileDownload: FileDownloadResponse = await $api.workflows.downloadNextflowFile(labId, path);
    if (fileDownload) {
      const fileContent = `data:${mimeType};base64,${fileDownload.Data}`;
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.body.innerHTML = `<iframe src="${fileContent}" width="100%" height="100%"></iframe>`;
      }
    }
  }

  return {
    handleS3Download,
    downloadFolder,
    openFileInNewWindow,
    isSupportedFileType,
  };
}
