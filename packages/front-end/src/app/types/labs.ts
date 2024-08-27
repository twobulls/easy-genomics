import { z } from 'zod';

const LabNameSchema = z
  .string()
  .trim()
  .min(1, 'Lab name is required')
  .max(128, 'Lab name must be no more than 128 characters');

const LabDescriptionSchema = z.string().trim().max(500, 'Description must be no longer than 500 characters').optional();

/**
 * No max character limit as it needs to store the encrypted version of the token
 * from the server, which could be any length. The raw token input by the user
 * is validated in the EGLabDetailsForm component as it handles special cases
 * for edit mode when the token value may or may not be updated by the user.
 */
const NextFlowTowerAccessTokenSchema = z.string().trim().optional();

const NextFlowTowerWorkspaceIdSchema = z
  .string()
  .trim()
  .max(128, 'Workspace ID must be no more than 128 characters')
  .optional();

const S3BucketSchema = z.string().trim().max(63, 'S3 bucket name must be no more than 63 characters').optional();

// Just the fields required for read-only display
const LabDetailsSchema = z.object({
  Name: LabNameSchema,
  Description: LabDescriptionSchema,
  NextFlowTowerAccessToken: NextFlowTowerAccessTokenSchema,
  NextFlowTowerWorkspaceId: NextFlowTowerWorkspaceIdSchema,
  S3Bucket: S3BucketSchema.optional(),
});
type LabDetails = z.infer<typeof LabDetailsSchema>;

const LabDetailsFormModes = {
  Create: 'create',
  Edit: 'edit',
  ReadOnly: 'read-only',
} as const;
const LabDetailsFormModeEnum = z.nativeEnum(LabDetailsFormModes);
type LabDetailsFormMode = z.infer<typeof LabDetailsFormModeEnum>;

export {
  LabDescriptionSchema,
  LabDetailsFormModeEnum,
  LabDetailsFormModes,
  LabDetailsSchema,
  LabNameSchema,
  NextFlowTowerAccessTokenSchema,
  NextFlowTowerWorkspaceIdSchema,
  S3BucketSchema,
  type LabDetails,
  type LabDetailsFormMode,
};
