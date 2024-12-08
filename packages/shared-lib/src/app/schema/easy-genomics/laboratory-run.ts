import { z } from 'zod';

const literalSchema = z.union([z.string(), z.number(), z.boolean(), z.null()]);
type Literal = z.infer<typeof literalSchema>;
type Json = Literal | { [key: string]: Json } | Json[];
const jsonSchema: z.ZodType<Json> = z.lazy(() => z.union([literalSchema, z.array(jsonSchema), z.record(jsonSchema)]));

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
    Settings: z.string().optional(), // JSON as a string
    CreatedAt: z.string().optional(),
    CreatedBy: z.string().optional(),
    ModifiedAt: z.string().optional(),
    ModifiedBy: z.string().optional(),
  })
  .strict();

export const ReadLaboratoryRunSchema = z
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
    Settings: z.record(z.string(), jsonSchema).optional(), // JSON
    CreatedAt: z.string().optional(),
    CreatedBy: z.string().optional(),
    ModifiedAt: z.string().optional(),
    ModifiedBy: z.string().optional(),
  })
  .strict();
export type ReadLaboratoryRun = z.infer<typeof ReadLaboratoryRunSchema>;

export const AddLaboratoryRunSchema = z
  .object({
    LaboratoryId: z.string().uuid(),
    OrganizationId: z.string().uuid(),
    Type: z.enum(['AWS HealthOmics', 'Seqera Cloud']),
    Status: z.string(),
    Title: z.string().optional(),
    WorkflowName: z.string().optional(),
    S3Input: z.string().optional(),
    S3Output: z.string().optional(),
    Settings: z.record(z.string(), jsonSchema).optional(), // JSON
  })
  .strict();
export type AddLaboratoryRun = z.infer<typeof AddLaboratoryRunSchema>;

export const EditLaboratoryRunSchema = z
  .object({
    Title: z.string().optional(),
    Status: z.string(),
    Settings: z.record(z.string(), jsonSchema).optional(),
    WorkflowName: z.string().optional(),
    S3Input: z.string().optional(),
    S3Output: z.string().optional(),
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
