import { z } from 'zod';
import { AwsHealthOmicsWorkflowsSchema, NextFlowTowerPipelinesSchema } from './laboratory';

export const LaboratoryPipelineSchema = z.object({
  PipelineId: z.string(),
  LaboratoryId: z.string(),
  OrganizationId: z.string(),
  Platform: z.enum(['AWS HealthOmics', 'Seqera Cloud']),
  CreatedAt: z.string().optional(),
  CreatedBy: z.string().optional(),
});
export type LaboratoryPipeline = z.infer<typeof LaboratoryPipelineSchema>;

export const UpdateLaboratoryPipelinesSchema = z.object({
  AwsHealthOmicsWorkflows: AwsHealthOmicsWorkflowsSchema,
  NextFlowTowerPipelines: NextFlowTowerPipelinesSchema,
  CreatedAt: z.string().optional(),
  CreatedBy: z.string().optional(),
});
export type UpdateLaboratoryPipelines = z.infer<typeof UpdateLaboratoryPipelinesSchema>;
