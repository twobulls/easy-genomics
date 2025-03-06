// create-file-upload-sample-sheet API SampleSheetRequest & SampleSheetResponse type definitions

export type SampleSheetRequest = {
  LaboratoryId: string;
  TransactionId: string;
  UploadedFilePairs: UploadedFilePairInfo[];
};

// DNA Sequenced R1 & R2 file pair of UploadedFileInfo type
export type UploadedFilePairInfo = {
  SampleId: string;
  R1?: UploadedFileInfo;
  R2?: UploadedFileInfo;
};

// Subset of FileUploadInfo type
export type UploadedFileInfo = {
  Bucket: string;
  Key: string;
  Region: string;
};

export type SampleSheetResponse = {
  TransactionId: string;
  SampleSheetInfo: SampleSheetInfo;
};

export type SampleSheetInfo = {
  Name: string;
  Size: number;
  Checksum: string;
  Bucket: string;
  Path: string;
  Key: string;
  Region: string;
  S3Url: string;
  SampleSheetType: string;
};
