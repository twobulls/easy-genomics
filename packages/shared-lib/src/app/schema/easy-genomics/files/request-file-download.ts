import { z } from 'zod';

// request-file-download API request validation schemas

export const RequestFileDownloadSchema = z
  .object({
    LaboratoryId: z.string(),
    Path: z.string(),
    FileName: z.string().optional(),
    MimeType: z.string().optional(),
    Size: z.number().optional(),
  })
  .strict();
