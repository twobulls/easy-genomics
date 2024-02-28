/**
 * The following LaboratoryUser model represents the data stored in the
 * laboratory-user-table to support user access controls for each
 * Laboratory.
 *
 * The LaboratoryId serves as the DynamoDB HashKey, and the UserId
 * serves as the DynamoDB SortKey - and cannot be modified after creation.
 *
 * A User can belong to one or more Laboratories, if required, and can also have
 * one or more roles within a Laboratory.
 *
 * {
 *   LaboratoryId: <string>,
 *   UserId: <string>,
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
  LaboratoryId: string; // DynamoDB Partition Key (String)
  UserId: string; // DynamoDB Sort Key (String) & Global Secondary Index (String)
}
