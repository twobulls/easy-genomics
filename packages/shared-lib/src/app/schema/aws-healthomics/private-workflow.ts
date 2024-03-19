import { z } from 'zod';

export const PrivateWorkflowSchema = z.object({
  Url: z.string(),
  Version: z.string(),
  PrivateWorkflowId: z.string().uuid(),
  Status: z.enum(['New', 'Cloned', 'Branched', 'Inspected', 'Built', 'Published', 'Active', 'Inactive']).optional(),
  EfsVolumeUri: z.string().optional(),
  CreatedAt: z.string().optional(),
  CreatedBy: z.string().optional(),
  ModifiedAt: z.string().optional(),
  ModifiedBy: z.string().optional(),
}).strict();

export const CreatePrivateWorkflowSchema = z.object({
  Url: z.string(),
  Version: z.string(),
}).strict();

export const RequestPrivateWorkflowSchema = z.object({
  Url: z.string(),
  Version: z.string(),
}).strict();

export const UpdatePrivateWorkflowSchema = z.object({
  Status: z.enum(['New', 'Cloned', 'Branched', 'Inspected', 'Built', 'Published', 'Active', 'Inactive']).optional(),
  EfsVolumeUri: z.string().optional(),
}).strict();