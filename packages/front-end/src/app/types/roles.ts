import { z } from 'zod';

export const LaboratoryRolesEnumSchema = z.nativeEnum({
  LabManager: 'Lab Manager',
  LabTechnician: 'Lab Technician',
  Unknown: 'Unknown',
} as const);
export type LaboratoryRolesEnum = z.infer<typeof LaboratoryRolesEnumSchema>;
