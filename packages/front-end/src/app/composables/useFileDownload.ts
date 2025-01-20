import { FileDownloadResponse } from '@/packages/shared-lib/src/app/types/nf-tower/file/request-file-download';
import { saveAs } from 'file-saver';

export default function useFileDownload() {
  const { $api } = useNuxtApp();

  // Downloads a file from S3 using a presigned URL and saves it locally
  async function handleS3Download(labId: string, fileName: string, path: string) {
    const fileDownloadPath = `${path}/${fileName}`;

    try {
      // Fetch the presigned URL from the API
      const fileDownloadResponse: FileDownloadResponse = await $api.file.downloadS3file(labId, fileDownloadPath);

      if (!fileDownloadResponse || !fileDownloadResponse.DownloadUrl) {
        console.error('Download URL is undefined or empty');
        return;
      }

      const downloadUrl = fileDownloadResponse.DownloadUrl;

      // Fetch the file from the presigned URL
      const response = await fetch(downloadUrl);

      if (!response.ok) {
        throw new Error(`Failed to download file: ${response.statusText}`);
      }

      // Convert the response to a blob
      const blob = await response.blob();

      // Use FileSaver to save the blob to a file
      saveAs(blob, fileName);
    } catch (error) {
      console.error('Error during file download:', error);
    }
  }

  // Placeholder for future functionality to download folders as zip files
  async function downloadFolder() {
    // TODO: Implement folder download as a zip file once the API is available
    useToastStore().info('Downloading folders is not implemented yet');
  }

  // Checks if the file extension is supported for download
  function isSupportedFileType(filename: string): boolean {
    const supportedExtensions = ['.csv', '.txt'];
    const extensionIndex = filename.lastIndexOf('.');

    if (extensionIndex === -1) {
      return false; // No extension found
    }

    const extension = filename.slice(extensionIndex).toLowerCase();
    return supportedExtensions.includes(extension);
  }

  // Opens a file in a new window or tab, displaying it in an iframe
  async function openFileInNewWindow(labId: string, path: string, mimeType: string) {
    const fileDownload: FileDownloadResponse = await $api.seqeraRuns.downloadSeqeraFile(labId, path);
    if (fileDownload) {
      const blob = base64ToBlob(fileDownload.Data, mimeType);
      const fileURL = URL.createObjectURL(blob);
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.body.innerHTML = `<iframe src="${fileURL}" width="100%" height="100%"></iframe>`;
        URL.revokeObjectURL(fileURL); // Revoke after use to free memory
      }
    }
  }

  // Converts a Base64 string to a Blob object
  function base64ToBlob(base64Data: string, contentType: string) {
    if (!base64Data) {
      throw new Error('base64Data is undefined or empty');
    }

    // Sanitize the base64 input and ensure proper padding
    const sanitizedBase64Data = base64Data.replace(/[^A-Za-z0-9+/=]/g, '');
    const padding = sanitizedBase64Data.length % 4;
    const paddedBase64Data = sanitizedBase64Data + (padding === 2 ? '==' : padding === 3 ? '=' : '');

    try {
      // Decode base64 string to bytes
      const byteCharacters = atob(paddedBase64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      return new Blob([byteArray], { type: contentType });
    } catch (error) {
      console.error('Failed to decode base64 string:', error);
      throw new Error('Invalid base64 string provided');
    }
  }

  return {
    handleS3Download,
    downloadFolder,
    openFileInNewWindow,
    isSupportedFileType,
  };
}
