import { z } from 'zod';

export const ConfigurationSettingsSchema = z.object({
  ['aws-account-id']: z.number(),
  ['aws-region']: z.string(),
  ['env-type']: z.enum(['dev', 'pre-prod', 'prod']),
  ['app-domain-name']: z.string(),
  ['aws-hosted-zone-id']: z.string().nullable(), // Not required when env-type: 'dev', but must exist if configured

  // Back-End specific settings
  ['back-end']: z.object({
    ['secret-key']: z.string(), // JWT signing secret
    ['system-admin-email']: z.string(),
    ['system-admin-password']: z.string(), // Initial Cognito password
  }),

  // Front-End specific settings
  ['front-end']: z.object({
    // The following Front-End Web UI / Nuxt Config settings will need to be sourced from the Back-End deployment.
    ['aws-api-gateway-url']: z.string().nullable(),
    ['aws-cognito-user-pool-id']: z.string().nullable(),
    ['aws-cognito-user-pool-client-id']: z.string().nullable(),

    // The following Front-End Infrastructure settings will need to be pre-configured in AWS.
    ['aws-certificate-arn']: z.string(),
  }),
}).strict();
