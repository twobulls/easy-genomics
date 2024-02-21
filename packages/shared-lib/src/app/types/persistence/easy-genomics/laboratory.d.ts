/**
 * The following Laboratory model represents the data stored in the
 * laboratory-table to store the Laboratory specific settings.
 *
 * A Laboratory can only belong to one Organization.
 *
 * {
 *   OrganizationId: <UUID>,
 *   LaboratoryId: <UUID>,
 *   Name: <string>,
 *   OmicsAccess?: <boolean>,
 *   NextflowAccess?: <boolean>,
 *   NextflowWorkspace?: <string>,
 *   CreatedAt?: <string>,
 *   CreatedBy?: <string>,
 *   ModifiedAt?: <string>,
 *   ModifiedBy?: <string>,
 * }
 */
import { BaseAttributes } from '../base-entity';

export interface Laboratory extends BaseAttributes {
  OrganizationId: string; // DynamoDB Partition Key (UUID)
  LaboratoryId: string; // DynamoDB Sort Key (UUID)
  Name: string; // LSI
  OmicsAccess?: boolean;
  NextflowAccess?: boolean;
  NextflowWorkspace?: string;
}
