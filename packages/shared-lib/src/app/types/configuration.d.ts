export interface VpcPeeringSettings {
  ['external-vpc-id']: string; // External peering VPC Id
  ['external-aws-account-id']: string; // AWS Account Id of external peering VPC
  ['external-aws-region']: string; // AWS Region of external peering VPC
  ['external-role-arn']: string; // Role ARN to assume
  ['external-cidr-block']: string; // External peering VPC Cidr Block
}

export interface ConfigurationSettings {
  ['aws-account-id']: string;
  ['aws-region']: string;
  ['env-type']: 'dev' | 'pre-prod' | 'prod';
  ['app-domain-name']: string;
  // The following Front-End Infrastructure settings will need to be pre-configured in AWS and defined when 'env-type' is 'pre-prod' or 'prod'.
  ['aws-hosted-zone-id']?: string; // Not required when env-type: 'dev', but must exist for the same app-domain-name if configured
  ['aws-certificate-arn']?: string; // Not required when env-type: 'dev', but must exist for the same app-domain-name if configured

  // Back-End specific settings
  ['back-end']: {
    ['jwt-secret-key']?: string; // Optional: If undefined, generate a random value on deployment for JWT Signature
    ['sys-admin-email']?: string;
    ['sys-admin-password']?: string; // Initial Cognito password
    ['org-admin-email']: string;
    ['org-admin-password']: string; // Initial Cognito password
    ['lab-manager-email']?: string,
    ['lab-manager-password']?: string, // Initial Cognito password
    ['lab-technician-email']?: string,
    ['lab-technician-password']?: string, // Initial Cognito password
    ['seqera-api-base-url']?: string; // Optional: Update for self-hosted Seqera API Base URL; if unspecified this defaults to 'https://api.cloud.seqera.io'
    ['vpc-peering']?: VpcPeeringSettings; // Optional: VPC Peering Accepter details
  };

  // Front-End specific settings
  ['front-end']?: {};
}

export interface Configuration {
  ['env-name']: ConfigurationSettings;
}
