import { z } from 'zod';

export const LaboratoryUserDetailsSchema = z
  .object({
    LaboratoryId: z.string().uuid(),
    UserId: z.string().uuid(),
    LabManager: z.boolean(),
    LabTechnician: z.boolean(),
    PreferredName: z.string(),
    FirstName: z.string(),
    LastName: z.string(),
    UserEmail: z.string(),
  })
  .strict();
export type LaboratoryUserDetails = z.infer<typeof LaboratoryUserDetailsSchema>;
