// TODO: Refactor schemas and types - https://dept-au.atlassian.net/browse/EG-504
// - Use schemas and types instead of interfaces and remove '*.d.ts' files
// - Use 'zod' for schema validation and type inference
// - A type inferred from a schema should exist in the same file as the schema - remove the 'src/app/schema/' directory and contents
// - All related types should exist in the same file e.g.LabUser, OrgUser, etc.
// - Replace all instances of strings in the codebase with enums where applicable e.g. 'Active', 'Inactive', 'Invited' etc.
// - Review and refine all types for API input and output to ensure they meet the requirements of the back - end and front - end
// - Use camelCase for all type names instead of PascalCase to be consistent with javascript naming conventions

import { z } from 'zod';
import { LaboratoryRolesEnumSchema } from './roles';
import { UserStatusSchema } from './status';
import { LaboratoryUserDetailsSchema } from '../../schema/easy-genomics/laboratory-user-details';
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