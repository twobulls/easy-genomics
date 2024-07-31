import { z } from 'zod';

// create-file-upload-sample-sheet API request validation schemas

export const UploadedFileInfoSchema = z
  .object({
    Name: z.string(),
    Size: z.number(),
    Bucket: z.string(),
    Key: z.string(),
    Region: z.string(),
    S3Url: z.string(),
  })
  .strict();

// DNA Sequenced R1 & R2 file pair of UploadedFileInfoSchema type
export const UploadedFilePairInfoSchema = z
  .object({
    R1: UploadedFileInfoSchema,
    R2: UploadedFileInfoSchema,
  })
  .strict();

export const SampleSheetRequestSchema = z
  .object({
    LaboratoryId: z.string().uuid(),
    TransactionId: z.string().uuid(),
    UploadedFilePairs: z.array(UploadedFilePairInfoSchema),
  })
  .strict();
