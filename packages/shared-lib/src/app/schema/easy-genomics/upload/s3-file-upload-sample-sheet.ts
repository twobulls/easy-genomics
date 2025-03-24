import { z } from 'zod';

// create-file-upload-sample-sheet API request validation schemas

export const UploadedFileInfoSchema = z
  .object({
    Bucket: z.string(),
    Key: z.string(),
    Region: z.string(),
  })
  .strict();

// DNA Sequenced single read or paired R1 & R2 reads for UploadedFileInfoSchema type
export const UploadedFilePairInfoSchema = z
  .object({
    SampleId: z.string(),
    R1: UploadedFileInfoSchema.optional().nullable(),
    R2: UploadedFileInfoSchema.optional().nullable(),
  })
  .strict();

export const SampleSheetRequestSchema = z
  .object({
    SampleSheetName: z.string(),
    LaboratoryId: z.string().uuid(),
    TransactionId: z.string().uuid(),
    Platform: z.enum(['AWS HealthOmics', 'Seqera Cloud']),
    UploadedFilePairs: z.array(UploadedFilePairInfoSchema),
  })
  .strict();
