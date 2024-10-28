import { z } from 'zod';

// request-file-download-url API request validation schemas
export const RequestFileDownloadUrlSchema = z
  .object({
    LaboratoryId: z.string(),
    S3Uri: z.string(),
    FileName: z.string().optional(),
    MimeType: z.string().optional(),
    Size: z.number().optional(),
  })
  .strict();

export const FileDownloadUrlResponseSchema = z
  .object({
    DownloadUrl: z.string(), // Pre-signed S3 Download URL
  })
  .strict();
