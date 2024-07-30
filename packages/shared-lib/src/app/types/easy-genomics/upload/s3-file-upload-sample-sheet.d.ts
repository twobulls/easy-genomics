// create-file-upload-sample-sheet API SampleSheetRequest & SampleSheetResponse type definitions
import { FileUploadInfo } from "./s3-file-upload-manifest";

export type SampleSheetRequest = {
  LaboratoryId: string,
  TransactionId: string,
  UploadedFilePairs: UploadedFilePairInfo[]
};

// DNA Sequenced R1 & R2 file pair of UploadedFileInfo type
export type UploadedFilePairInfo = {
  R1: UploadedFileInfo;
  R2: UploadedFileInfo;
}

// Same as FileUploadInfo type without multi-part details: UploadId, MultiParts
export type UploadedFileInfo = Omit<FileUploadInfo, 'UploadId'|'MultiParts'>;

export type SampleSheetResponse = {
  TransactionId: string,
  SampleSheet?: SampleSheetInfo,
};

export type SampleSheetInfo = {
  Name: string,
  Size: number,
  Bucket: string,
  Key: string,
  Region: string,
  S3Url: string,
  S3UrlChecksum: string,
}
