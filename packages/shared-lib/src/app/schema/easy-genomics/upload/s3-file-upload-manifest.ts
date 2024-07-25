import { z } from 'zod';

// create-file-upload-request API manifest request validation schemas
export const UploadFileRequestSchema = z
  .object({
    Name: z.string(),
    Size: z.number(),
  });

export const RequestFileUploadManifestSchema = z
  .object({
    LaboratoryId: z.string().uuid(),
    TransactionId: z.string().uuid(),
    Files: z.array(UploadFileRequestSchema),
  })
  .strict();
