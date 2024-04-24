import { z } from 'zod';

export const ConfigurationSettingsSchema = z.object({
  ['aws-account-id']: z.number(),
  ['aws-region']: z.enum(['us-east-1', 'us-west-2', 'ap-southeast-1', 'ap-southeast-2', 'eu-central-1', 'eu-west-1', 'eu-west-2']),
  ['aws-cognito-user-pool-id']: z.string(),
  ['aws-cognito-client-id']: z.string(),
  ['aws-hosted-zone-id']: z.string(),
  ['aws-hosted-zone-name']: z.string(),
  ['aws-certificate-arn']: z.string(),
  ['env-type']: z.enum(['dev', 'pre-prod', 'prod']),
  ['sub-domain']: z.string().optional(),
  ['domain-name']: z.string(),
  ['base-api-url']: z.string(),
  ['system-admin-email']: z.string().optional(),
  ['mock-org-id']: z.string().optional(), // TODO: cleanup (used by FE only for testing)
}).strict();
