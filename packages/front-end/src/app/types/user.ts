import { z } from 'zod';

export const FirstNameSchema = z.string().trim().min(1, 'First name is required');

export const LastNameSchema = z.string().trim().min(1, 'Last name is required');

export const ProfileDetailsSchema = z.object({
  firstName: FirstNameSchema,
  lastName: LastNameSchema,
});
export type ProfileDetails = z.infer<typeof ProfileDetailsSchema>;
