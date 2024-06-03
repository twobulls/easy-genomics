import { z } from 'zod';

export function useOrgForm() {
  const orgName = ref('');
  const orgDescription = ref('');
  const ORG_NAME_MIN_LENGTH = 1;
  const ORG_NAME_MAX_LENGTH = 50;
  const ORG_DESCRIPTION_MAX_LENGTH = 500;

  const orgNameCharCount = computed(() => orgName.value.length);
  const orgDescriptionCharCount = computed(() => orgDescription.value.length);

  const orgNameSchema = z
    .string()
    .min(ORG_NAME_MIN_LENGTH, { message: `Name must be at least ${ORG_NAME_MIN_LENGTH} characters` })
    .max(ORG_NAME_MAX_LENGTH, { message: `${ORG_NAME_MAX_LENGTH} characters max` });

  const orgDescriptionSchema = z
    .string()
    .min(0)
    .max(ORG_DESCRIPTION_MAX_LENGTH, { message: `${ORG_DESCRIPTION_MAX_LENGTH} characters max` });

  const orgDetailsFormSchema = z.object({
    Name: orgNameSchema,
    Description: orgDescriptionSchema,
  });

  return {
    orgName,
    orgDescription,
    orgNameCharCount,
    orgDescriptionCharCount,
    orgNameSchema,
    orgDescriptionSchema,
    orgDetailsFormSchema,
    ORG_NAME_MIN_LENGTH,
    ORG_NAME_MAX_LENGTH,
    ORG_DESCRIPTION_MAX_LENGTH,
  };
}
