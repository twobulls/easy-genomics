import { z } from 'zod';

export const LabNameSchema = z.string().trim().min(1, 'Lab name is required').max(128, 'Lab name must be no more than 128 characters');
export const LabDescriptionSchema = z.string().trim().max(500, 'Description must be no longer than 500 characters').optional();
export const LabNextFlowTowerAccessTokenSchema = z.string().trim().max(128, 'Personal access token must be no more than 128 characters').optional();
export const LabNextFlowTowerWorkspaceIdSchema = z.string().trim().max(128, 'Workspace ID must be no more than 128 characters').optional();

export const LabDetailsFormSchema = z.object({
  Name: LabNameSchema,
  Description: LabDescriptionSchema,
  NextFlowTowerAccessToken: LabNextFlowTowerAccessTokenSchema,
  NextFlowTowerWorkspaceId: LabNextFlowTowerWorkspaceIdSchema,
}).strict();

export type LabDetailsForm = z.infer<typeof LabDetailsFormSchema>;

const FormModes = {
  Create: 'create',
  Edit: 'edit',
  ReadOnly: 'read-only',
} as const;
export const FormModeEnum = z.nativeEnum(FormModes)
export type FormModeEnum = z.infer<typeof FormModeEnum>;
