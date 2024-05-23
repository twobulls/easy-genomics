import { z } from 'zod';

export const DeletedResponseSchema = z.object({
  Status: z.enum(['Success']),
});
export type DeletedResponse = z.infer<typeof DeletedResponseSchema>;
