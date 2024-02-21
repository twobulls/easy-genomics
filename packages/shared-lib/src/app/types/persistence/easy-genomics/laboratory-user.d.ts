/**
 * The following LaboratoryUser model represents the data stored in the
 * laboratory-user-table to support user access controls for each
 * Laboratory.
 *
 * {
 *   LaboratoryId: <UUID>,
 *   UserId: <UUID>,
 *   LabManager?: 'Active' | 'Inactive' | null,
 *   LabTechnician?: 'Active' | 'Inactive' | null,
 *   CreatedAt?: <string>,
 *   CreatedBy?: <string>,
 *   ModifiedAt?: <string>,
 *   ModifiedBy?: <string>,
 * }
 */
import { BaseAttributes } from '../base-entity';
import { LaboratoryRoles } from './roles';

export interface LaboratoryUser extends LaboratoryRoles, BaseAttributes {
  LaboratoryId: string; // DynamoDB Partition Key (UUID)
  UserId: string; // DynamoDB Sort Key (UUID)
}
