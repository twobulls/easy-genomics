/**
 * The following Laboratory model represents the data stored in the
 * laboratory-table to store the Laboratory specific settings.
 *
 * The OrganizationId serves as the DynamoDB HashKey, and the LaboratoryId
 * serves as the DynamoDB SortKey - and cannot be modified after creation.
 *
 * The Laboratory Name is modifiable but it is enforced to be unique within the
 * Organization via a transaction that checks the 'unique-reference-table' for
 * uniqueness.
 *
 * {
 *   OrganizationId: <string>,
 *   LaboratoryId: <string>,
 *   Name: <string>,
 *   Status: <string>,
 *   S3Bucket?: <string>
 *   AwsHealthOmicsEnabled?: <boolean>,
 *   NextFlowTowerEnabled?: <boolean>,
 *   CreatedAt?: <string>,
 *   CreatedBy?: <string>,
 *   ModifiedAt?: <string>,
 *   ModifiedBy?: <string>,
 * }
 */
import { BaseAttributes, Status } from "../base-entity";

export interface Laboratory extends BaseAttributes {
  OrganizationId: string; // DynamoDB Partition Key (String)
  LaboratoryId: string; // DynamoDB Sort Key (String) & Global Secondary Index (String)
  Name: string;
  Status: Status,
  S3Bucket?: string;
  AwsHealthOmicsEnabled?: boolean;
  NextFlowTowerEnabled?: boolean;
}
