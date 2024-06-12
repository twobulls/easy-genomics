import { z } from 'zod';
import { LaboratoryRolesEnumSchema } from './roles';
import { LaboratoryUserDetailsSchema } from '../../schema/easy-genomics/laboratory-user-details';
import { UserStatusSchema } from './status';
import { OrganizationUserDetailsSchema } from '../../schema/easy-genomics/organization-user-details';

// Extends the LaboratoryUserDetailsSchema with additional fields
// for use in the front-end
export const LabUserSchema = LaboratoryUserDetailsSchema.extend({
  assignedRole: LaboratoryRolesEnumSchema,
  displayName: z.string().min(1),
  status: UserStatusSchema,
});
export type LabUser = z.infer<typeof LabUserSchema>;

export const OrgUserSchema = OrganizationUserDetailsSchema.extend({
  displayName: z.string().min(1),
});
export type OrgUser = z.infer<typeof OrgUserSchema>;