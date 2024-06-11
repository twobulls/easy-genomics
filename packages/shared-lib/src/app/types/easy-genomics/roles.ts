import { z } from 'zod';

export const OrganizationRolesSchema = z.object({
  OrganizationAdmin: z.boolean(),
});
export type OrganizationRoles = z.infer<typeof OrganizationRolesSchema>;

export const LaboratoryRolesSchema = z.object({
  LabManager: z.boolean(),
  LabTechnician: z.boolean(),
});
export type LaboratoryRoles = z.infer<typeof LaboratoryRolesSchema>;

export const LaboratoryRolesEnumSchema = z.nativeEnum({
  LabManager: 'Lab Manager',
  LabTechnician: 'Lab Technician',
} as const);
export type LaboratoryRolesEnum = z.infer<typeof LaboratoryRolesEnumSchema>;
