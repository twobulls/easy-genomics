import { z } from 'zod';

export const OrganizationSchema = z.object({
  OrganizationId: z.string().uuid(),
  Name: z.string(),
  Country: z.string().optional(),
  AwsHealthOmicsEnabled: z.boolean().optional(),
  NextFlowTowerEnabled: z.boolean().optional(),
  CreatedAt: z.string().optional(),
  CreatedBy: z.string().optional(),
  ModifiedAt: z.string().optional(),
  ModifiedBy: z.string().optional(),
}).strict();

export const CreateOrganizationSchema = z.object({
  Name: z.string(),
  Country: z.string().optional(),
  AwsHealthOmicsEnabled: z.boolean().optional(),
  NextFlowTowerEnabled: z.boolean().optional(),
}).strict();

export const UpdateOrganizationSchema = z.object({
  Name: z.string(),
  Country: z.string().optional(),
  AwsHealthOmicsEnabled: z.boolean().optional(),
  NextFlowTowerEnabled: z.boolean().optional(),
}).strict();