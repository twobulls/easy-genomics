import { z } from 'zod';

export const OrganizationSchema = z
  .object({
    OrganizationId: z.string().uuid(),
    Name: z.string(),
    Description: z.string().optional(),
    Country: z.string().optional(),
    AwsHealthOmicsEnabled: z.boolean().optional(),
    NextFlowTowerEnabled: z.boolean().optional(),
    NextFlowTowerApiBaseUrl: z.string().optional(),
    CreatedAt: z.string().optional(),
    CreatedBy: z.string().optional(),
    ModifiedAt: z.string().optional(),
    ModifiedBy: z.string().optional(),
  })
  .strict();

export const CreateOrganizationSchema = z
  .object({
    Name: z.string(),
    Description: z.string().optional(),
    Country: z.string().optional(),
    AwsHealthOmicsEnabled: z.boolean().optional(),
    NextFlowTowerEnabled: z.boolean().optional(),
    NextFlowTowerApiBaseUrl: z.string().optional(),
  })
  .strict();

export const UpdateOrganizationSchema = z
  .object({
    Name: z.string(),
    Description: z.string().optional(),
    Country: z.string().optional(),
    AwsHealthOmicsEnabled: z.boolean().optional(),
    NextFlowTowerEnabled: z.boolean().optional(),
    NextFlowTowerApiBaseUrl: z.string().optional(),
  })
  .strict();
