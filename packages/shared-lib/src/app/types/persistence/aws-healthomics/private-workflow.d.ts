/**
 * The following PrivateWorkflow model represents the data stored in the
 * healthomics-private-workflow-table.
 *
 * The Url serves as the DynamoDB HashKey, and the Version serves as the
 * DynamoDB SortKey - and cannot be modified after creation.
 *
 * The Id field is a Global Secondary Index (GSI) and serves to support quick
 * referencing of the record for updating, and deleting via a REST API.
 *
 * {
 *   Url: <string>,
 *   Version: <string>,
 *   Status?: <string>,
 *   EfsVolumeUri?: <string>,
 *   CreatedAt?: <string>,
 *   CreatedBy?: <string>,
 *   ModifiedAt?: <string>,
 *   ModifiedBy?: <string>,
 * }
 */
import { BaseAttributes } from '../base-entity';

export interface PrivateWorkflow extends BaseAttributes {
  Url: string; // DynamoDB Partition Key (String)
  Version: string; // DynamoDB Sort Key (String)
  Id: string; // DynamoDB Global Secondary Index (String)
  Status?: WorkflowStatus;
  EfsVolumeUri?: string;
}

export type WorkflowStatus = 'New' | 'Cloned' | 'Branched' | 'Inspected' | 'Built' | 'Published' | 'Active' | 'Inactive' | null;