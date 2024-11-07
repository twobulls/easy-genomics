// request-list-bucket-objects API type definition
export type RequestListBucketObjects = {
  LaboratoryId: string;
  S3Bucket?: string;
  S3Prefix?: string;
  MaxKeys?: number;
};
