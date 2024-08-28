import { z } from 'zod';

export const CreateUserInvitationRequestSchema = z
  .object({
    OrganizationId: z.string().uuid(),
    Email: z.string(),
  })
  .strict();

export const ConfirmUpdateUserInvitationRequestSchema = z
  .object({
    Token: z.string(),
    FirstName: z.string(),
    LastName: z.string(),
    Password: z.string(),
  })
  .strict();
