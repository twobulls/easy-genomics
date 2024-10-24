import { z } from 'zod';

// request-file-download API request validation schemas
export const RequestFileDownloadSchema = z
  .object({
    LaboratoryId: z.string(),
    ContentUri: z.string(),
  })
  .strict();

export const FileDownloadResponseSchema = z
  .object({
    Data: z.string(), // Base64 encoded
  })
  .strict();
