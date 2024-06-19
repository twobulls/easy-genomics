import { z } from 'zod';

export const LabNameSchema = z.string().trim().min(1, 'Lab name is required').max(128, 'Lab name must be no more than 128 characters');
export const LabDescriptionSchema = z.string().trim().max(500, 'Description must be no longer than 500 characters').optional();
export const NextFlowTowerAccessTokenInputSchema = z.string().trim().max(128, 'Personal access token must be no more than 128 characters').optional();
export const NextFlowTowerWorkspaceIdInputSchema = z.string().trim().max(128, 'Workspace ID must be no more than 128 characters').optional();

// Just the fields required for read-only display
export const LabDetailsSchema = z.object({
  Name: LabNameSchema,
  Description: LabDescriptionSchema,
  NextFlowTowerWorkspaceId: NextFlowTowerWorkspaceIdInputSchema,
});

// The fields required for creating a lab
export const LabDetailsInputSchema = z.object({
  Name: LabNameSchema,
  Description: LabDescriptionSchema,
  NextFlowTowerAccessToken: NextFlowTowerAccessTokenInputSchema,
  NextFlowTowerWorkspaceId: NextFlowTowerWorkspaceIdInputSchema,
}).strict();

export type LabDetailsInput = z.infer<typeof LabDetailsInputSchema>;

const LabDetailsFormModes = {
  Create: 'create',
  Edit: 'edit',
  ReadOnly: 'read-only',
} as const;
export const LabDetailsFormModeEnum = z.nativeEnum(LabDetailsFormModes)
export type LabDetailsFormModeEnum = z.infer<typeof LabDetailsFormModeEnum>;
