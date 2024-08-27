import { z } from 'zod';

export const EmailSchema = z.string().email();
export type Email = z.infer<typeof EmailSchema>;

export const NonEmptyStringSchema = z.string().min(1);
export type NonEmptyString = z.infer<typeof NonEmptyStringSchema>;

export const UuidSchema = z.string().uuid();
export type Uuid = z.infer<typeof UuidSchema>;
