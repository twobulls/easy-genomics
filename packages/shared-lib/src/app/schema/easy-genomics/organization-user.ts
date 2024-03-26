import { z } from 'zod';

export const RequestOrganizationUserSchema = z.object({
  OrganizationId: z.string().uuid(),
  UserId: z.string().uuid(),
}).strict();
