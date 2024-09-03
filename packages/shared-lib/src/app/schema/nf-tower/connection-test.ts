import { z } from 'zod';

export const RequestNFConnectionTestSchema = z
  .object({
    WorkspaceId: z.string().min(1),
    AccessToken: z.string().min(1),
  })
  .strict();
