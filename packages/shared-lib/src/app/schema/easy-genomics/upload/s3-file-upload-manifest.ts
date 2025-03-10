import { z } from 'zod';

// create-file-upload-request API request validation schemas
export const FileInfoSchema = z.object({
  Name: z.string(),
  Size: z.number(),
});

export const FileUploadRequestSchema = z
  .object({
    LaboratoryId: z.string().uuid(),
    TransactionId: z.string().uuid(),
    Platform: z.enum(['AWS HealthOmics', 'Seqera Cloud']),
    Files: z.array(FileInfoSchema),
  })
  .strict();
