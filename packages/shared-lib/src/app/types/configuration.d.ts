export interface ConfigurationSettings {
  ['aws-account-id']: number,
  ['aws-region']: 'us-east-1' | 'us-west-2' | 'ap-southeast-1' | 'ap-southeast-2' | 'eu-central-1' | 'eu-west-1' | 'eu-west-2',
  ['env-type']: 'dev' | 'pre-prod' | 'prod',
  ['application-url']: string,

  // Back-End specific settings
  ['back-end']: {
    ['system-admin-email']: string,
    ['system-admin-password']: string, // Initial Cognito password
  }

  // Front-End specific settings
  ['front-end']: {
    // The following Front-End Infrastructure settings will need to be pre-configured in AWS.
    ['aws-hosted-zone-id']: string,
    ['aws-hosted-zone-name']: string,
    ['aws-certificate-arn']: string,

    // The following Front-End Web UI / Nuxt Config settings will need to be sourced from the Back-End deployment.
    ['aws-cognito-user-pool-id']: string,
    ['aws-cognito-client-id']: string,
    ['base-api-url']: string, // TODO: Replace with application-url once APIGateway uses custom domains
    ['mock-org-id']: string, // TODO: Remove once custom User Authorization logic retrieves OrgIds
  }
}

export interface Configuration {
  ['env-name']: ConfigurationSettings;
}
