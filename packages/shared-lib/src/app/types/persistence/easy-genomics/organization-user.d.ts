/**
 * The following OrganizationUser model represents the data stored in the
 * organization-user-table to define the User's role association with
 * an Organization.
 *
 * The OrganizationId serves as the DynamoDB HashKey, and the UserId serves as
 * the DynamoDB SortKey - and cannot be modified after creation.
 *
 * A User can belong to one or more Organizations, if required, and can also
 * have one or more roles within an Organization.
 *
 * {
 *   OrganizationId: <string>,
 *   UserId: <string>,
 *   OrganizationAdmin?: 'Active' | 'Inactive' | null,
 *   LabManager?: 'Active' | 'Inactive' | null,
 *   LabTechnician?: 'Active' | 'Inactive' | null,
 *   CreatedAt?: <string>,
 *   CreatedBy?: <string>,
 *   ModifiedAt?: <string>,
 *   ModifiedBy?: <string>,
 * }
 */
import { BaseAttributes } from '../base-entity';
import { OrganizationRoles } from './roles';

export interface OrganizationUser extends OrganizationRoles, BaseAttributes {
  OrganizationId: string; // DynamoDB Partition Key (String)
  UserId: string; // DynamoDB Sort Key (String) & Global Secondary Index (String)
}
