import { z } from 'zod';

// request-list-bucket-objects API request validation schemas
export const RequestListBucketObjectsSchema = z
  .object({
    LaboratoryId: z.string(),
    S3Bucket: z.string().optional(),
    S3Prefix: z.string().optional(),
    MaxKeys: z.number().optional(),
  })
  .strict();

export const S3ObjectSchema = z.object({
  Key: z.string(),
  LastModified: z.string(),
  ETag: z.string(),
  Size: z.number(),
  StorageClass: z.string(),
});

export const S3ResponseSchema = z.object({
  $metadata: z.object({
    httpStatusCode: z.number(),
    requestId: z.string(),
    extendedRequestId: z.string(),
    attempts: z.number(),
    totalRetryDelay: z.number(),
  }),
  Contents: z.array(S3ObjectSchema),
});
