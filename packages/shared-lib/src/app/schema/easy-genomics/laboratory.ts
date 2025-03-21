import { z } from 'zod';

export const LaboratorySchema = z
  .object({
    OrganizationId: z.string().uuid(),
    LaboratoryId: z.string().uuid(),
    Name: z.string(),
    Description: z.string().optional(),
    S3Bucket: z.string().optional(),
    Status: z.enum(['Active', 'Inactive']),
    AwsHealthOmicsEnabled: z.boolean().optional(),
    NextFlowTowerEnabled: z.boolean().optional(),
    NextFlowTowerApiBaseUrl: z.string().optional(),
    NextFlowTowerWorkspaceId: z.string().optional(),
    CreatedAt: z.string().optional(),
    CreatedBy: z.string().optional(),
    ModifiedAt: z.string().optional(),
    ModifiedBy: z.string().optional(),
  })
  .strict();

export const CreateLaboratorySchema = z
  .object({
    OrganizationId: z.string().uuid(),
    Name: z.string(),
    Description: z.string().optional(),
    S3Bucket: z.string().optional(),
    Status: z.enum(['Active', 'Inactive']),
    AwsHealthOmicsEnabled: z.boolean().optional(),
    NextFlowTowerEnabled: z.boolean().optional(),
    NextFlowTowerApiBaseUrl: z.string().optional(),
    NextFlowTowerAccessToken: z.string().optional(),
    NextFlowTowerWorkspaceId: z.string().optional(),
  })
  .strict();
export type CreateLaboratory = z.infer<typeof CreateLaboratorySchema>;

export const ReadLaboratorySchema = z
  .object({
    OrganizationId: z.string().uuid(),
    LaboratoryId: z.string().uuid(),
    Name: z.string(),
    Description: z.string().optional(),
    S3Bucket: z.string().optional(),
    Status: z.enum(['Active', 'Inactive']),
    AwsHealthOmicsEnabled: z.boolean().optional(),
    NextFlowTowerEnabled: z.boolean().optional(),
    NextFlowTowerApiBaseUrl: z.string().optional(),
    NextFlowTowerWorkspaceId: z.string().optional(),
    HasNextFlowTowerAccessToken: z.boolean().optional(), // Return boolean indicator instead of actual NextFlowTowerAccessToken
    CreatedAt: z.string().optional(),
    CreatedBy: z.string().optional(),
    ModifiedAt: z.string().optional(),
    ModifiedBy: z.string().optional(),
  })
  .strict();
export type ReadLaboratory = z.infer<typeof ReadLaboratorySchema>;

export const RequestLaboratorySchema = z
  .object({
    OrganizationId: z.string().uuid(),
    LaboratoryId: z.string().uuid(),
  })
  .strict();

export const UpdateLaboratorySchema = z.object({
  Name: z.string(),
  Description: z.string().optional(),
  S3Bucket: z.string().optional(),
  Status: z.enum(['Active', 'Inactive']),
  AwsHealthOmicsEnabled: z.boolean().optional(),
  NextFlowTowerEnabled: z.boolean().optional(),
  NextFlowTowerApiBaseUrl: z.string().optional(),
  NextFlowTowerAccessToken: z.string().optional(),
  NextFlowTowerWorkspaceId: z.string().optional(),
});
export type UpdateLaboratory = z.infer<typeof UpdateLaboratorySchema>;
