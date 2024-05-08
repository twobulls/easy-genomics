import { z } from 'zod';

export const DeletedResponseSchema = z.object({
  deleted: z.boolean(),
});
export type DeletedResponse = z.infer<typeof DeletedResponseSchema>;
