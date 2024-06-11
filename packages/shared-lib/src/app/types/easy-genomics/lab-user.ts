import { z } from 'zod';
import { LaboratoryRolesEnumSchema } from './roles';
import { LaboratoryUserDetailsSchema } from '../../schema/easy-genomics/laboratory-user-details';

// Extends the LaboratoryUserDetailsSchema with additional fields
// for use in the front-end
export const LabUserSchema = LaboratoryUserDetailsSchema.extend({
  AssignedRole: LaboratoryRolesEnumSchema,
  DisplayName: z.string(),
  Status: z.enum(['Active', 'Inactive']),
});
export type LabUser = z.infer<typeof LabUserSchema>;