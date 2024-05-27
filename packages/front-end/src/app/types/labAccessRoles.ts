import { z } from 'zod';

export const LabAccessRolesEnum = z.enum(['LabTechnician', 'LabManager']);
export type LabAccessRoles = z.infer<typeof LabAccessRolesEnum>;
