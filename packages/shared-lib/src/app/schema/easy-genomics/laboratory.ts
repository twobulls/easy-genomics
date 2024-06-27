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
    NextFlowTowerAccessToken: z.string().optional(), // Encrypted
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
    Status: z.enum(['Active', 'Inactive']),
    AwsHealthOmicsEnabled: z.boolean().optional(),
    NextFlowTowerEnabled: z.boolean().optional(),
    NextFlowTowerAccessToken: z.string().optional(), // Plain Text
    NextFlowTowerWorkspaceId: z.string().optional(),
  })
  .strict();
export type CreateLaboratory = z.infer<typeof CreateLaboratorySchema>;

export const RequestLaboratorySchema = z
  .object({
    OrganizationId: z.string().uuid(),
    LaboratoryId: z.string().uuid(),
  })
  .strict();

export const UpdateLaboratorySchema = z.object({
  LaboratoryId: z.string().uuid(),
  OrganizationId: z.string().uuid(),
  Name: z.string(),
  Description: z.string().optional(),
  S3Bucket: z.string().optional(),
  Status: z.enum(['Active', 'Inactive']),
  AwsHealthOmicsEnabled: z.boolean().optional(),
  NextFlowTowerEnabled: z.boolean().optional(),
  NextFlowTowerAccessToken: z.string().optional(), // Encrypted or Plain Text (Encrypted if this value was not edited, otherwise Plain Text)
  NextFlowTowerWorkspaceId: z.string().optional(),
});
export type UpdateLaboratory = z.infer<typeof UpdateLaboratorySchema>;
