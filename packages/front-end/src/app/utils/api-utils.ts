import { ZodSchema } from 'zod';

export function validateApiResponse<T>(schema: ZodSchema<T>, data: any) {
  const validation = schema.safeParse(data);

  if (!validation.success) {
    console.error('Validation error details:', validation.error.issues);
    throw new Error('Failed to validate API response: ' + validation.error.message);
  }
}

/**
 * Strip null properties from an array of objects - example usage might be to remove null properties from
 * a Seqera API response to allow the Zod schema to validate the response
 * @param items
 */
export function stripNullProperties(items: Array<any>): Array<any> {
  return items.map((item) => {
    return Object.fromEntries(Object.entries(item).filter(([, value]) => value !== null));
  });
}
