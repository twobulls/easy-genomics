import { z } from 'zod';

export const StatusEnum = z.enum(['FAILED', 'CANCELLED', 'COMPLETED', 'RUNNING', 'SUBMITTED', 'SUCCEEDED', 'UNKNOWN']);
export type Status = z.infer<typeof StatusEnum>;
