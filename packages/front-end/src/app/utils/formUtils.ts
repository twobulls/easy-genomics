import * as z from 'zod';

export const NAME_MIN_LENGTH = 1;
export const NAME_MAX_LENGTH = 50;

export const nameSchema = z
  .string()
  .min(NAME_MIN_LENGTH, { message: `Name must be at least ${NAME_MIN_LENGTH} characters` })
  .max(NAME_MAX_LENGTH, { message: `Name must be less than ${NAME_MAX_LENGTH} characters` });

export const DESCRIPTION_MAX_LENGTH = 500;
export const descriptionSchema = z
  .string()
  .min(0)
  .max(DESCRIPTION_MAX_LENGTH, {
    message: `Description must be less than ${DESCRIPTION_MAX_LENGTH} characters`,
  });

export const formSchema = z.object({
  Name: nameSchema,
  Description: descriptionSchema,
});

export type FormSchema = z.infer<typeof formSchema>;
