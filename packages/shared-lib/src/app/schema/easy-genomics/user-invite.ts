import { z } from 'zod';

export const CreateUserInviteSchema = z.object({
  OrganizationId: z.string().uuid(),
  Email: z.string(),
}).strict();
