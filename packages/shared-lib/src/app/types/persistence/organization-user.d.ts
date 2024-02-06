/**
 * The following OrganizationUser model represents the data stored in the
 * organization-user-table to define the User's role association with
 * an Organization.
 *
 * A User can belong to one or more Organizations, if required.
 *
 * A User can have one or more roles in an Organization. This is to support
 * access control various hierarchical restricted and/or mutually-exclusive
 * functionality.
 *
 * {
 *   OrganizationId: <UUID>,
 *   UserId: <UUID>,
 *   OrganizationAdmin?: 'Active' | 'Inactive' | null,
 *   LabManager?: 'Active' | 'Inactive' | null,
 *   LabTechnician?: 'Active' | 'Inactive' | null,
 *   CreatedAt?: <string>,
 *   CreatedBy?: <string>,
 *   ModifiedAt?: <string>,
 *   ModifiedBy?: <string>,
 * }
 */
import { BaseAttributes, OrganizationRoles } from './base-entity';

export interface OrganizationUser extends OrganizationRoles, BaseAttributes {
  OrganizationId: string; // DynamoDB Partition Key (UUID)
  UserId: string; // DynamoDB Sort Key (UUID) & GSI
}
