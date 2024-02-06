/**
 * The following Organization model represents the data stored in the
 * organization-table.
 *
 * {
 *   OrganizationId: <UUID>,
 *   Name: <string>,
 *   Country: <string>,
 *   AwsAccount: <string>,
 *   AwsRegion: <string>,
 *   NextflowAccount?: <string>,
 *   BillingContact?: <string>,
 *   BillingMethod?: <string>,
 *   CreatedAt?: <string>,
 *   CreatedBy?: <string>,
 *   ModifiedAt?: <string>,
 *   ModifiedBy?: <string>,
 * }
 */
import { BaseAttributes } from './base-entity';

export interface Organization extends BaseAttributes {
  OrganizationId: string; // DynamoDB Partition Key (UUID)
  Name: string;
  Country: string;
  AwsAccount: string;
  AwsRegion: string;
  NextflowAccount?: string;
  BillingContact?: string;
  BillingMethod?: string;
}
