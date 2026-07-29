/**
 * The following WorkflowRunPreset model represents a named, reusable set of AWS
 * HealthOmics workflow run parameters stored in the workflow-run-preset-table.
 *
 * Both personal and laboratory-shared presets live in the same table. The
 * LaboratoryId serves as the DynamoDB HashKey and the PresetKey serves as the
 * DynamoDB SortKey, where the sort key prefix separates the two tiers:
 *
 *   Personal:   USER#<UserId>#<WorkflowId>#<PresetId>
 *   Laboratory: LAB#<WorkflowId>#<PresetId>
 *
 * This keeps every preset a user can see within a single partition, so the run
 * form loads both tiers with two prefix queries and no secondary index.
 *
 * {
 *   LaboratoryId: <string>,
 *   PresetKey: <string>,
 *   PresetId: <string>,
 *   Scope: <'USER' | 'LAB'>,
 *   WorkflowId: <string>,
 *   Name: <string>,
 *   Params: <Record<string, string | number | boolean>>,
 *   CreatedAt?: <string>,
 *   CreatedBy?: <string>,
 *   CreatedByEmail?: <string>,
 *   ModifiedAt?: <string>,
 *   ModifiedBy?: <string>,
 * }
 */
import { BaseAttributes } from '../base-entity';

export const WORKFLOW_RUN_PRESET_SCOPES = ['USER', 'LAB'] as const;
export type WorkflowRunPresetScope = (typeof WORKFLOW_RUN_PRESET_SCOPES)[number];

/**
 * Maximum presets one owner may keep per workflow, applied independently to each
 * tier: a user may hold 5 personal presets for a workflow, and the laboratory a
 * further 5 shared ones.
 */
export const WORKFLOW_RUN_PRESET_LIMIT = 5;

export const WORKFLOW_RUN_PRESET_NAME_MAX_LENGTH = 60;

/**
 * Run parameter values as rendered by the workflow parameter form. Nested objects
 * and arrays are intentionally unsupported — the HealthOmics parameter template is
 * a flat map of scalars.
 */
export type WorkflowRunPresetParams = Record<string, string | number | boolean>;

export interface WorkflowRunPreset extends BaseAttributes {
  LaboratoryId: string; // DynamoDB Partition Key (String)
  PresetKey: string; // DynamoDB Sort Key (String)
  PresetId: string;
  Scope: WorkflowRunPresetScope;
  WorkflowId: string;
  Name: string;
  Params: WorkflowRunPresetParams;
  /** Email of the creating user, denormalised so shared lab presets can show authorship without a user lookup. */
  CreatedByEmail?: string;
}

export interface ListWorkflowRunPresetsResponse {
  /** Presets owned by the calling user for this laboratory + workflow. */
  UserPresets: WorkflowRunPreset[];
  /** Presets shared with the whole laboratory for this workflow. */
  LabPresets: WorkflowRunPreset[];
}
