import { z } from 'zod';

export const ConfigurationSettingsSchema = z
  .object({
    ['aws-account-id']: z.string(),
    ['aws-region']: z.string(),
    ['env-type']: z.enum(['dev', 'pre-prod', 'prod']),
    ['app-domain-name']: z.string(),
    // The following Front-End Infrastructure settings will need to be pre-configured in AWS and defined when 'env-type' is 'pre-prod' or 'prod'.
    ['aws-hosted-zone-id']: z.string().nullable(), // Not required when env-type: 'dev', but must exist for the same app-domain-name if configured
    ['aws-certificate-arn']: z.string().nullable(), // Not required when env-type: 'dev', but must exist for the same app-domain-name if configured

    // Back-End specific settings
    ['back-end']: z.object({
      ['jwt-secret-key']: z.string().nullable().optional(), // Optional: If undefined, generate a random value on deployment for JWT Signature
      ['system-admin-email']: z.string().nullable().optional(),
      ['system-admin-password']: z.string().nullable().optional(), // Initial Cognito password
      ['test-user-email']: z.string(),
      ['test-user-password']: z.string(), // Initial Cognito password
      ['seqera-api-base-url']: z.string().nullable().optional(), // Optional: Update for self-hosted Seqera API Base URL; if unspecified this defaults to 'https://api.cloud.seqera.io'
    }),

    // Front-End specific settings
    ['front-end']: z.object({}).nullable().optional(),
  })
  .strict();
