import { z } from 'zod';

export const CreateUserForgotPasswordRequestSchema = z.object({
  Email: z.string(),
}).strict();
