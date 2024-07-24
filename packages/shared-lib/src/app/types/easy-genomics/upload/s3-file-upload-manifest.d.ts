export type UploadFileRequest = {
  Name: string,
  Size: number,
};

export type RequestFileUploadManifest = {
  LaboratoryId: string,
  Files: UploadFileRequest[]
};

export type UploadFilePart = {
  PartNo: number,
  Start: number,
  End: number,
  ETag?: string,
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

export type ResponseFileUploadManifest = {
  TransactionId: string,
  Files: UploadFileResponse[]
};