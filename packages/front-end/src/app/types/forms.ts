import { z } from 'zod';

const AutoCompleteOptions = {
  On: 'on',
  Off: 'off',
  CurrentPassword: 'current-password',
  NewPassword: 'new-password',
  FirstName: 'given-name',
  LastName: 'family-name',
} as const;
export const AutoCompleteOptionsEnum = z.nativeEnum(AutoCompleteOptions);
export type AutoCompleteOption = z.infer<typeof AutoCompleteOptionsEnum>;
