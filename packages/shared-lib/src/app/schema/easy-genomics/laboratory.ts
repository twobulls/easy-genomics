import { z } from 'zod';

export const LaboratorySchema = z.object({
  OrganizationId: z.string().uuid(),
  LaboratoryId: z.string().uuid(),
  Name: z.string(),
  S3Bucket: z.string().optional(),
  Status: z.enum(['Active', 'Inactive']),
  AwsHealthOmicsEnabled: z.boolean().optional(),
  NextFlowTowerEnabled: z.boolean().optional(),
  CreatedAt: z.string().optional(),
  CreatedBy: z.string().optional(),
  ModifiedAt: z.string().optional(),
  ModifiedBy: z.string().optional(),
}).strict();

export const CreateLaboratorySchema = z.object({
  OrganizationId: z.string().uuid(),
  Name: z.string(),
  Status: z.enum(['Active', 'Inactive']),
  AwsHealthOmicsEnabled: z.boolean().optional(),
  NextFlowTowerEnabled: z.boolean().optional(),
}).strict();

export const RequestLaboratorySchema = z.object({
  OrganizationId: z.string().uuid(),
  LaboratoryId: z.string().uuid(),
}).strict();

export const UpdateLaboratorySchema = z.object({
  Name: z.string(),
  S3Bucket: z.string().optional(),
  Status: z.enum(['Active', 'Inactive']),
  AwsHealthOmicsEnabled: z.boolean().optional(),
  NextFlowTowerEnabled: z.boolean().optional(),
}).strict();