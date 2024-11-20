import { z } from 'zod';

// request-list-bucket-objects API request validation schemas
export const createS3ZipSchema = z
  .object({
    LaboratoryId: z.string(),
    S3Bucket: z.string().optional(),
    S3Prefix: z.string(),
    MaxKeys: z.number().optional(),
  })
  .strict();
