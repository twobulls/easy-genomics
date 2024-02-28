/**
 * The following Organization model represents the data stored in the
 * organization-table.
 *
 * The OrganizationId serves as the Hash Key and is unique, and cannot be
 * modified after creation.
 *
 * The Organization Name is modifiable but it is enforced to be unique via a
 * transaction that checks the 'unique-reference-table' for uniqueness.
 *
 * {
 *   OrganizationId: <string>,
 *   Name: <string>,
 *   Country?: <string>,
 *   AwsHealthOmicsEnabled?: <string>,
 *   NextFlowTowerEnabled?: <string>,
 *   BillingContact?: <string>,
 *   BillingMethod?: <string>,
 *   CreatedAt?: <string>,
 *   CreatedBy?: <string>,
 *   ModifiedAt?: <string>,
 *   ModifiedBy?: <string>,
 * }
 */
import { BaseAttributes } from '../base-entity';

export interface Organization extends BaseAttributes {
  OrganizationId: string; // DynamoDB Partition Key (String)
  Name: string;
  Country?: string;
  AwsHealthOmicsEnabled?: boolean,
  NextFlowTowerEnabled?: boolean,
  BillingContact?: string;
  BillingMethod?: string;
}
