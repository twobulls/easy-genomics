import { OrganizationUserDetailsSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/organization-user-details';
import { z } from 'zod';

const OrgUserDetailsSchema = OrganizationUserDetailsSchema.extend({
  displayName: z.string(),
});
export type OrgUserDetails = z.infer<typeof OrgUserDetailsSchema>;
