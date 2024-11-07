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
