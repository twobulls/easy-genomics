/**
 * The following PrivateWorkflow model represents the data stored in the
 * healthomics-private-workflow-table.
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
  Status?: WorkflowStatus;
  EfsVolumeUri?: string;
}

export type WorkflowStatus = 'New' | 'Cloned' | 'Branched' | 'Inspected' | 'Built' | 'Published' | 'Active' | 'Inactive' | null;