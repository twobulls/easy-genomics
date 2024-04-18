import { z } from 'zod';

export const OrganizationUserDetailsSchema = z.object({
  OrganizationId: z.string().uuid(),
  UserId: z.string().uuid(),
  OrganizationUserStatus: z.enum(['Active', 'Inactive']),
  OrganizationAdmin: z.boolean(),
  UserDisplayName: z.string().optional(),
  UserEmail: z.string().optional(),
}).strict();
