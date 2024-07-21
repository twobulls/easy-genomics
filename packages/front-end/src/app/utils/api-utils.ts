import { ZodSchema } from 'zod';

export function validateApiResponse<T>(schema: ZodSchema<T>, data: any) {
  const validation = schema.safeParse(data);

  if (!validation.success) {
    throw new Error('Failed to validate API response: ', validation.error);
  }
}

/**
 * Strip null properties from an array of objects - example usage might be to remove null properties from
 * a Nextflow Tower API response to allow the Zod schema to validate the response
 * @param val
 */
export function stripNullProperties(val: Array<any>): Array<any> {
  return val.map((val) => {
    return Object.fromEntries(Object.entries(val).filter(([, value]) => value !== null));
  });
}
