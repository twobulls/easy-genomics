import { z } from 'zod';

export const RequestNFConnectionTestSchema = z
  .object({
    WorkspaceId: z.string(),
    AccessToken: z.string(),
  })
  .strict();
