// request-file-download API type definition
export type RequestFileDownload = {
  LaboratoryId: string;
  ContentUri: string;
};

export type FileDownloadResponse = {
  Data: string; // Base64 encoded
};