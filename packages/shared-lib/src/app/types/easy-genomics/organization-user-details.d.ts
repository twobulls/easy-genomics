/**
 * The following OrganizationUserDetails model defines the DTO for the
 * /easy-genomics/organization/user/organization-users-details API response
 * for display in the FE.
 *
 * {
 *   UserId: <string>,
 *   LaboratoryId: <string>,
 *   LabManager: <boolean>,
 *   LabTechnician: <boolean>,
 *   UserDisplayName?: <string>,
 *   UserEmail?: <string>,
 *   UserStatus?: <string>
 * }
 */
import { Status } from '../base-entity';

export interface OrganizationUserDetails {
  UserId: string;
  OrganizationId: string;
  OrganizationUserStatus: Status;
  OrganizationAdmin: boolean;
  UserDisplayName?: string;
  UserEmail?: string;
  UserStatus?: string;
}
