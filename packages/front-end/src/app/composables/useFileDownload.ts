import { FileDownloadResponse } from '@/packages/shared-lib/src/app/types/nf-tower/file/request-file-download';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { Ref } from '.nuxt/imports';

export default function useFileDownload() {
  const { $api } = useNuxtApp();

  // Downloads a file from S3 using a presigned URL and saves it locally
  async function handleS3Download(
    labId: string,
    fileName: string,
    path: string,
    progressVar?: Ref<number> | undefined,
  ) {
    const fileDownloadPath = `${path}/${fileName}`;

    try {
      // Fetch the presigned URL from the API
      const fileDownloadResponse: FileDownloadResponse = await $api.file.fetchPresignedS3Url(labId, fileDownloadPath);

      if (!fileDownloadResponse || !fileDownloadResponse.DownloadUrl) {
        console.error('Download URL is undefined or empty');
        return;
      }

      const downloadUrl = fileDownloadResponse.DownloadUrl;

      // Download the file to memory
      const response = await axios({
        method: 'GET',
        url: downloadUrl,
        responseType: 'arraybuffer',
        // handle progress events
        onDownloadProgress: (progressEvent) => {
          // set the value of the progress ref if it's been provided
          if (progressVar !== undefined) {
            progressVar.value = Math.round((progressEvent?.loaded / progressEvent?.total) * 100);
          }
        },
      });

      // Convert ArrayBuffer response data to blob
      const blob = new Blob([response.data]);

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

  return {
    handleS3Download,
    downloadFolder,
    getSignedCsvContent,
    isSupportedFileType,
  };
}
