// request-list-bucket-objects API type definition
export type RequestListBucketObjects = {
  LaboratoryId: string;
  S3Bucket?: string;
  S3Prefix?: string;
  MaxKeys?: number;
};

export interface S3Object {
  Key: string;
  LastModified: string;
  ETag: string;
  Size: number;
  StorageClass: string;
}

export interface S3Response {
  $metadata: {
    httpStatusCode: number;
    requestId: string;
    extendedRequestId: string;
    attempts: number;
    totalRetryDelay: number;
  };
  Contents: S3Object[];
}