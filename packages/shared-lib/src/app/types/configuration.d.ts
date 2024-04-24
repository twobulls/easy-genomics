export interface ConfigurationSettings {
  ['aws-account-id']: number,
  ['aws-region']: 'us-east-1' | 'us-west-2' | 'ap-southeast-1' | 'ap-southeast-2' | 'eu-central-1' | 'eu-west-1' | 'eu-west-2',
  ['aws-cognito-user-pool-id']: string,
  ['aws-cognito-client-id']: string,
  ['aws-hosted-zone-id']: string,
  ['aws-hosted-zone-name']: string,
  ['aws-certificate-arn']: string,
  ['env-type']: 'dev' | 'pre-prod' | 'prod',
  ['sub-domain']?: string,
  ['domain-name']: string,
  ['base-api-url']: string,
  ['system-admin-email']?: string,
  ['mock-org-id']?: string, // TODO: cleanup (used by FE only for testing)
}

export interface Configuration {
  ['env-name']: ConfigurationSettings;
}
