import { z } from 'zod';

export const LaboratorySchema = z.object({
  OrganizationId: z.string().uuid(),
  LaboratoryId: z.string().uuid(),
  Name: z.string(),
  Description: z.string().optional(),
  S3Bucket: z.string().optional(),
  Status: z.enum(['Active', 'Inactive']),
  AwsHealthOmicsEnabled: z.boolean().optional(),
  NextFlowTowerEnabled: z.boolean().optional(),
  NextFlowTowerApiToken: z.string().optional(), // Encrypted
  NextFlowTowerWorkspaceId: z.string().optional(),
  CreatedAt: z.string().optional(),
  CreatedBy: z.string().optional(),
  ModifiedAt: z.string().optional(),
  ModifiedBy: z.string().optional(),
}).strict();

export const CreateLaboratorySchema = z.object({
  OrganizationId: z.string().uuid(),
  Name: z.string(),
  Description: z.string().optional(),
  Status: z.enum(['Active', 'Inactive']),
  AwsHealthOmicsEnabled: z.boolean().optional(),
  NextFlowTowerEnabled: z.boolean().optional(),
  NextFlowTowerApiToken: z.string().optional(),
  NextFlowTowerWorkspaceId: z.string().optional(), // Encrypted
}).strict();

export const RequestLaboratorySchema = z.object({
  OrganizationId: z.string().uuid(),
  LaboratoryId: z.string().uuid(),
}).strict();

export const UpdateLaboratorySchema = z.object({
  Name: z.string(),
  Description: z.string().optional(),
  S3Bucket: z.string().optional(),
  Status: z.enum(['Active', 'Inactive']),
  AwsHealthOmicsEnabled: z.boolean().optional(),
  NextFlowTowerEnabled: z.boolean().optional(),
  NextFlowTowerApiToken: z.string().optional(),
  NextFlowTowerWorkspaceId: z.string().optional(), // Encrypted
}).strict();