import { z } from 'zod';

const LabNameSchema = z.string().trim().min(1, 'Lab name is required').max(128, 'Lab name must be no more than 128 characters');
const LabDescriptionSchema = z.string().trim().max(500, 'Description must be no longer than 500 characters').optional();
const LabNextFlowTowerAccessTokenSchema = z.string().trim().max(128, 'Personal access token must be no more than 128 characters').optional();
const LabNextFlowTowerWorkspaceIdSchema = z.string().trim().max(128, 'Workspace ID must be no more than 128 characters').optional();

const LabDetailsFormSchema = z.object({
  Name: LabNameSchema,
  Description: LabDescriptionSchema,
  NextFlowTowerAccessToken: LabNextFlowTowerAccessTokenSchema,
  NextFlowTowerWorkspaceId: LabNextFlowTowerWorkspaceIdSchema,
}).strict();

type LabDetailsForm = z.infer<typeof LabDetailsFormSchema>;

export {
  LabNameSchema,
  LabDescriptionSchema,
  LabNextFlowTowerAccessTokenSchema,
  LabNextFlowTowerWorkspaceIdSchema,
  LabDetailsFormSchema,
  type LabDetailsForm,
}