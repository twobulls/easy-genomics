import { z } from 'zod';

const userStatuses = ['Active', 'Inactive', 'Invited'] as const;

export const UserStatusSchema = z.enum(userStatuses);
export type UserStatus = z.infer<typeof UserStatusSchema>;