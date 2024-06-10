import { z } from 'zod';

export const CreateUserForgotPasswordRequestSchema = z.object({
  Email: z.string(),
}).strict();

export const ConfirmUserForgotPasswordRequestSchema = z.object({
  Token: z.string(),
  Password: z.string(),
}).strict();
