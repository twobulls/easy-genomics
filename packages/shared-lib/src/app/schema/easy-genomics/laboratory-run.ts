import { z } from 'zod';

export const LaboratoryRunSchema = z
  .object({
    LaboratoryId: z.string().uuid(),
    RunId: z.string().uuid(),
    UserId: z.string().uuid(),
    OrganizationId: z.string().uuid(),
    Type: z.enum(['AWS HealthOmics', 'Seqera Cloud']),
    Status: z.string(),
    Title: z.string().optional(),
    WorkflowName: z.string().optional(),
    S3Input: z.string().optional(),
    S3Output: z.string().optional(),
    Settings: z.string().optional(), // JSON
    CreatedAt: z.string().optional(),
    CreatedBy: z.string().optional(),
    ModifiedAt: z.string().optional(),
    ModifiedBy: z.string().optional(),
  })
  .strict();

export const AddLaboratoryRunSchema = z
  .object({
    LaboratoryId: z.string().uuid(),
    RunId: z.string().uuid(),
    UserId: z.string().uuid(),
    OrganizationId: z.string().uuid(),
    Type: z.enum(['AWS HealthOmics', 'Seqera Cloud']),
    Status: z.string(),
    Title: z.string().optional(),
    WorkflowName: z.string().optional(),
    S3Input: z.string().optional(),
    S3Output: z.string().optional(),
    Settings: z.string().optional(), // JSON
  })
  .strict();

export const EditLaboratoryRunSchema = z
  .object({
    LaboratoryId: z.string().uuid(),
    RunId: z.string().uuid(),
    Title: z.string().optional(),
    Status: z.string(),
  })
  .strict();
export type EditLaboratoryRun = z.infer<typeof EditLaboratoryRunSchema>;

export const RemoveLaboratoryRunSchema = z
  .object({
    LaboratoryId: z.string().uuid(),
    RunId: z.string().uuid(),
  })
  .strict();

export const RequestLaboratoryRunSchema = z
  .object({
    LaboratoryId: z.string().uuid(),
    RunId: z.string().uuid(),
  })
  .strict();
