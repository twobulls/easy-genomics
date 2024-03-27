import { z } from 'zod';

export const OrganizationUserSchema = z.object({
  OrganizationId: z.string().uuid(),
  UserId: z.string().uuid(),
  Status: z.enum(['Active', 'Inactive']),
  OrganizationAdmin: z.boolean(),
  CreatedAt: z.string().optional(),
  CreatedBy: z.string().optional(),
  ModifiedAt: z.string().optional(),
  ModifiedBy: z.string().optional(),
}).strict();

export const AddOrganizationUserSchema = z.object({
  OrganizationId: z.string().uuid(),
  UserId: z.string().uuid(),
  Status: z.enum(['Active', 'Inactive']),
  OrganizationAdmin: z.boolean(),
}).strict();

export const RequestOrganizationUserSchema = z.object({
  OrganizationId: z.string().uuid(),
  UserId: z.string().uuid(),
}).strict();

export const RemoveOrganizationUserSchema = z.object({
  OrganizationId: z.string().uuid(),
  UserId: z.string().uuid(),
}).strict();
