import { z } from 'zod';

/**
 * The following Zod schema is a customized definition for Easy Genomics based
 * upon the AWS HealthOmics StartRun interface:
 *
 * The fields marked as optional can be ignored or overridden by a supplied
 * value if required.
 *
 * The roleArn is marked optional, so it can be overridden by the Easy Genomics
 * implementation with the appropriate RoleArn value for the deployment.
 */
export const CreateRunRequestSchema = z
  .object({
    workflowId: z.string(),
    requestId: z.string(), // Easy Genomics TransactionId
    name: z.string(),
    parameters: z.string(),
    roleArn: z.string().optional(), // 'easy-genomics-healthomics-workflow-run-role'
    workflowType: z.enum(['READY2RUN', 'PRIVATE']).optional(),
    outputUri: z.string().optional(),
    cacheId: z.string().optional(),
    cacheBehavior: z.enum(['CACHE_ON_FAILURE', 'CACHE_ALWAYS']).optional(),
    runGroupId: z.string().optional(),
    priority: z.number().optional(),
    storageCapacity: z.number().optional(),
    logLevel: z.enum(['ALL', 'ERROR', 'FATAL', 'OFF']).optional(),
    retentionMode: z.enum(['RETAIN', 'REMOVE']).optional(),
    storageType: z.enum(['STATIC', 'DYNAMIC']).optional(),
    workflowOwnerId: z.string().optional(),
  })
  .strict();
