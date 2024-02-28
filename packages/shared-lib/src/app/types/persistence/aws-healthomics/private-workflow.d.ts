/**
 * The following PrivateWorkflow model represents the data stored in the
 * healthomics-private-workflow-table.
 *
 * The Url serves as the DynamoDB HashKey, and the Version serves as the
 * DynamoDB SortKey - and cannot be modified after creation.
 *
 * {
 *   Url: <string>,
 *   Version: <string>,
 *   PrivateWorkflowId: <string>
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
  PrivateWorkflowId: string; // DynamoDB Global Secondary Index (String)
  Status?: WorkflowStatus;
  EfsVolumeUri?: string;
}

export type WorkflowStatus = 'New' | 'Cloned' | 'Branched' | 'Inspected' | 'Built' | 'Published' | 'Active' | 'Inactive' | null;