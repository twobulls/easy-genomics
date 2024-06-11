import { z } from 'zod';
import { LaboratoryRolesEnumSchema } from './roles';
import { LaboratoryUserDetailsSchema } from '../../schema/easy-genomics/laboratory-user-details';
import { UserStatusSchema } from './status';

// Extends the LaboratoryUserDetailsSchema with additional fields
// for use in the front-end
export const LabUserSchema = LaboratoryUserDetailsSchema.extend({
  assignedRole: LaboratoryRolesEnumSchema,
  displayName: z.string().min(1),
  status: UserStatusSchema,
});
export type LabUser = z.infer<typeof LabUserSchema>;