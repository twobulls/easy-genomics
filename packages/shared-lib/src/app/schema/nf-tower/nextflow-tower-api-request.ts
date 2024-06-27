import { z } from 'zod';

export const NextFlowTowerApiRequestSchema = z
  .object({
    LaboratoryId: z.string().uuid(),
  }).strict();
