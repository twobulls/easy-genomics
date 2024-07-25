// create-file-upload-request API manifest request & response type definitions
export type RequestFileUploadManifest = {
  LaboratoryId: string,
  TransactionId: string,
  Files: UploadFileRequest[]
};

export type UploadFileRequest = {
  Name: string,
  Size: number,
};

export type ResponseFileUploadManifest = {
  TransactionId: string,
  Files: UploadFileResponse[]
};

export type UploadFileResponse = {
  Name: string,
  Size: number,
  Bucket: string,
  Key: string,
  S3Url: string,
  S3UrlChecksum: string,
  UploadId?: string,
  MultiParts?: UploadFilePart[],
}

export type UploadFilePart = {
  PartNo: number,
  Start: number,
  End: number,
  ETag?: string,
};
