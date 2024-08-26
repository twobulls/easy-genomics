export interface ConfigurationSettings {
  ['aws-account-id']: string,
  ['aws-region']: string,
  ['env-type']: 'dev' | 'pre-prod' | 'prod',
  ['app-domain-name']: string,
  ['aws-hosted-zone-id']?: string, // Not required when env-type: 'dev', but must exist if configured

  // Back-End specific settings
  ['back-end']: {
    ['jwt-secret-key']?: string, // Optional: If undefined, generate a random value on deployment for JWT Signature
    ['system-admin-email']?: string,
    ['system-admin-password']?: string, // Initial Cognito password
    ['test-user-email']: string,
    ['test-user-password']: string,
    ['seqera-api-base-url']?: string, // Optional: Update for self-hosted Seqera API Base URL; if unspecified this defaults to 'https://api.cloud.seqera.io'
  }

  // Front-End specific settings
  ['front-end']: {
    // The following Front-End Web UI / Nuxt Config settings will need to be sourced from the Back-End deployment.
    ['aws-api-gateway-url']?: string,

    // The following Front-End Infrastructure settings will need to be pre-configured in AWS and defined when 'env-type' is 'pre-prod' or 'prod'.
    ['aws-certificate-arn']?: string, // Not required when env-type: 'dev'
  }
}

export interface Configuration {
  ['env-name']: ConfigurationSettings;
}
