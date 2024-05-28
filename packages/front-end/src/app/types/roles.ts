import { z } from 'zod';

export const LaboratoryRolesEnumSchema = z.nativeEnum({
  LabManager: 'Lab Manager',
  LabTechnician: 'Lab Technician',
} as const);
export type LaboratoryRolesEnum = z.infer<typeof LaboratoryRolesEnumSchema>;
