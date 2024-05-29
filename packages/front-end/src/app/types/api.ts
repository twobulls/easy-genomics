import { z } from 'zod';

export const ErrorResponseSchema = z.object({
  Status: z.enum(['Error']),
});
export const DeletedResponseSchema = z.object({
  Status: z.enum(['Success']),
});
export const EditUserResponseSchema = z.object({
  Status: z.enum(['Success']),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;
export type DeletedResponse = z.infer<typeof DeletedResponseSchema>;
export type EditUserResponse = z.infer<typeof EditUserResponseSchema>;
