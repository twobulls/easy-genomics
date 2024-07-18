import { ZodSchema } from 'zod';

export function validateApiResponse<T>(schema: ZodSchema<T>, data: any) {
  const validation = schema.safeParse(data);

  if (validation.success) {
  } else {
    console.error('Error validating response:', validation.error);
    throw new Error('Failed to validate API response');
  }
}
