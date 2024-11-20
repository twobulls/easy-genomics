// create-s3-zip API type definition
export type createS3Zip = {
  LaboratoryId: string;
  S3Bucket?: string;
  S3Prefix: string;
  MaxKeys?: number;
};
