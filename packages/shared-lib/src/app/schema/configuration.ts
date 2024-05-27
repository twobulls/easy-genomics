import { z } from 'zod';

export const ConfigurationSettingsSchema = z.object({
  ['aws-account-id']: z.number(),
  ['aws-region']: z.enum(['us-east-1', 'us-west-2', 'ap-southeast-1', 'ap-southeast-2', 'eu-central-1', 'eu-west-1', 'eu-west-2']),
  ['env-type']: z.enum(['dev', 'pre-prod', 'prod']),
  ['application-url']: z.string(),

  // Back-End specific settings
  ['back-end']: z.object({
    ['system-admin-email']: z.string(),
    ['system-admin-password']: z.string(), // Initial Cognito password
    ['secret-key']: z.string(), // JWT signing secret
  }),

  // Front-End specific settings
  ['front-end']: z.object({
    // The following Front-End Infrastructure settings will need to be pre-configured in AWS.
    ['aws-hosted-zone-id']: z.string(),
    ['aws-hosted-zone-name']: z.string(),
    ['aws-certificate-arn']: z.string(),

    // The following Front-End Web UI / Nuxt Config settings will need to be sourced from the Back-End deployment.
    ['aws-cognito-user-pool-id']: z.string().nullable(),
    ['aws-cognito-client-id']: z.string().nullable(),
    ['base-api-url']: z.string().nullable(), // TODO: Replace with application-url once APIGateway uses custom domains
    ['mock-org-id']: z.string().nullable(), // TODO: Remove once custom User Authorization logic retrieves OrgIds
  }),
}).strict();
