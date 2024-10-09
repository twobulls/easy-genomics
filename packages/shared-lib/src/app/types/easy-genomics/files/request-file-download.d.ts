// request-file-download API type definition
export type RequestFileDownload = {
  LaboratoryId: string;
  Path: string;
  FileName?: string;
  MimeType?: string;
  Size?: number;
};

export type FileDownloadResponse = {
  DownloadUrl: string;
}