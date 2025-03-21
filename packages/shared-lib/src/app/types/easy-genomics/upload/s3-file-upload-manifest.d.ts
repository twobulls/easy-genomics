// create-file-upload-request API FileUploadRequest & FileUploadManifest type definitions
import { RunType } from "@SharedLib/types/base-entity";

export type FileUploadRequest = {
  LaboratoryId: string,
  TransactionId: string,
  Platform: RunType,
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
  UploadId?: string,
  MultiParts?: FileUploadPartInfo[],
}

export type FileUploadPartInfo = {
  PartNo: number,
  Start: number,
  End: number,
  ETag?: string,
};
