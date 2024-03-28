import { z } from 'zod';

export const UserSchema = z.object({
  UserId: z.string().uuid(),
  Email: z.string(),
  Title: z.string().optional(),
  FirstName: z.string().optional(),
  LastName: z.string().optional(),
  PhoneNumber: z.string().optional(),
  Status: z.enum(['Active', 'Inactive']),
  CreatedAt: z.string().optional(),
  CreatedBy: z.string().optional(),
  ModifiedAt: z.string().optional(),
  ModifiedBy: z.string().optional(),
}).strict();

export const CreateUserSchema = z.object({
  UserId: z.string().uuid(),
  Email: z.string(),
  Title: z.string().optional(),
  FirstName: z.string().optional(),
  LastName: z.string().optional(),
  PhoneNumber: z.string().optional(),
}).strict();
