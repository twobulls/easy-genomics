import { z } from 'zod';

export const ButtonVariantEnum = z.enum(['primary', 'secondary', 'ghost', 'destructive']);
export type ButtonVariant = z.infer<typeof ButtonVariantEnum>;

export const ButtonSizeEnum = z.enum(['xs', 'sm', 'md', 'lg']);
export type ButtonSize = z.infer<typeof ButtonSizeEnum>;
