export interface ConfigurationSettings {
  ['aws-account-id']: number,
  ['aws-region']: string,
  ['env-type']: 'dev' | 'pre-prod' | 'prod',
  ['app-domain-name']: string,

  // Back-End specific settings
  ['back-end']: {
    ['system-admin-email']: string,
    ['system-admin-password']: string, // Initial Cognito password
    ['secret-key']: string, // JWT signing secret
    ['test-user-email']: string,
    ['test-user-password']: string,
    ['seqera-api-base-url']?: string, // Optional: Update for self-hosted Seqera API Base URL; defaults to 'https://api.cloud.seqera.io'
  }

  // Front-End specific settings
  ['front-end']: {
    // The following Front-End Infrastructure settings will need to be pre-configured in AWS.
    ['aws-hosted-zone-id']: string,
    ['aws-certificate-arn']: string,

    // The following Front-End Web UI / Nuxt Config settings will need to be sourced from the Back-End deployment.
    ['aws-api-gateway-url']: string,
    ['aws-cognito-user-pool-id']: string,
    ['aws-cognito-user-pool-client-id']: string,
  }
}

export interface Configuration {
  ['env-name']: ConfigurationSettings;
}
