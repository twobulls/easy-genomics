/**
 * The following OrganizationUserDetails model defines the DTO for the
 * /easy-genomics/organization/user/organization-users-details API response
 * for display in the FE.
 *
 * {
 *   UserId: <string>,
 *   UserEmail: <string>,
 *   UserStatus: UserStatus,
 *   Title?: <string>
 *   PreferredName?: <string>
 *   FirstName?: <string>
 *   LastName?: <string>
 *   OrganizationId: <string>,
 *   OrganizationUserStatus: OrgUserStatus,
 *   OrganizationAdmin: <boolean>,
 *   OrganizationAccess?: OrganizationAccess
 * }
 */
import { OrgUserStatus, UserStatus } from '../base-entity';
import { OrganizationAccess } from "./user";

export interface OrganizationUserDetails {
  UserId: string;
  UserEmail: string;
  UserStatus: UserStatus;
  Title?: string;
  PreferredName?: string;
  FirstName?: string;
  LastName?: string;
  OrganizationId: string;
  OrganizationUserStatus: OrgUserStatus;
  OrganizationAdmin: boolean;
  OrganizationAccess?: OrganizationAccess;
}
