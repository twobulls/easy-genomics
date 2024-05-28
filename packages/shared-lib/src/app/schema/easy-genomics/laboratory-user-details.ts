import { z } from 'zod';

export const LaboratoryUserDetailsSchema = z
  .object({
    LaboratoryId: z.string().uuid(),
    UserId: z.string().uuid(),
    LabManager: z.boolean(),
    LabTechnician: z.boolean(),
    UserDisplayName: z.string().optional(),
    UserEmail: z.string().email().optional(),
  })
  .strict();
export type LaboratoryUserDetails = z.infer<typeof LaboratoryUserDetailsSchema>;
