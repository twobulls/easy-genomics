// request-file-download-url API type definition
export type RequestFileDownloadUrl = {
  LaboratoryId: string;
  S3Uri: string;
  FileName?: string;
  MimeType?: string;
  Size?: number;
};

export type FileDownloadUrlResponse = {
  DownloadUrl: string;  // Pre-signed S3 Download URL
}