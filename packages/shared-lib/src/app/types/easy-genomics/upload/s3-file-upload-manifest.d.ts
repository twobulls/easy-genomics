// create-file-upload-request API FileUploadRequest & FileUploadManifest type definitions
export type FileUploadRequest = {
  LaboratoryId: string,
  TransactionId: string,
  Files: FileInfo[]
};

export type FileInfo = {
  Name: string,
  Size: number,
};

export type FileUploadManifest = {
  TransactionId: string,
  Files: FileUploadInfo[]
};

export type FileUploadInfo = {
  Name: string,
  Size: number,
  Bucket: string,
  Key: string,
  Region: string,
  S3Url: string,
  S3UrlChecksum: string,
  UploadId?: string,
  MultiParts?: FileUploadPartInfo[],
}

export type FileUploadPartInfo = {
  PartNo: number,
  Start: number,
  End: number,
  ETag?: string,
};
