import { z } from 'zod';

export const NextFlowConnectionTestRequestSchema = z
  .object({
    OrganizationId: z.string().uuid(),
    LaboratoryId: z.string().uuid(),
    WorkspaceId: z.string().min(1),
    AccessToken: z.string().optional(),
  })
  .strict();