/**
 * The following LaboratoryRun model represents the data stored in the
 * laboratory-run-table to support tracking Seqera NextFlow / AWS HealthOmics
 * runs for each Laboratory.
 *
 * The LaboratoryId serves as the DynamoDB HashKey, and the RunId
 * serves as the DynamoDB SortKey - and cannot be modified after creation.
 *
 * {
 *   LaboratoryId: <string>,
 *   RunId: <string>,
 *   UserId: <string>,
 *   OrganizationId: <string>,
 *   Type: <string>,
 *   Status: <string>,
 *   Title?: <string>,
 *   WorkflowName?: <string>,
 *   ExternalRunId?: <string>,
 *   S3Input?: <string>,
 *   S3Output?: <string>,
 *   Settings?: <string>, // JSON
 *   CreatedAt?: <string>,
 *   CreatedBy?: <string>,
 *   ModifiedAt?: <string>,
 *   ModifiedBy?: <string>,
 * }
 */
import { BaseAttributes, RunType } from "../base-entity";

export interface LaboratoryRun extends BaseAttributes {
  LaboratoryId: string; // DynamoDB Partition Key (String)
  RunId: string; // DynamoDB Sort Key (String) & Global Secondary Index (String)
  UserId: string; // Global Secondary Index (String)
  OrganizationId: string; // Global Secondary Index (String)
  Type: RunType,
  Status: string;
  Title?: string;
  WorkflowName?: string;
  ExternalRunId?: string;
  S3Input?: string;
  S3Output?: string;
  Settings?: string; // JSON
}
