import { randomUUID } from 'crypto';
import { join } from 'path';
import { ConfigurationSettings } from '@easy-genomics/shared-lib/src/app/types/configuration';
import { loadConfigurations } from '@easy-genomics/shared-lib/src/app/utils/configuration';
import { App } from 'aws-cdk-lib';
import { BackEndStack } from './infra/stacks/back-end-stack';

const SEQERA_API_BASE_URL = 'https://api.cloud.seqera.io';
const app = new App();

let awsAccountId: string | undefined;
let awsRegion: string | undefined;
let envName: string | undefined;
let envType: string | undefined;
let appDomainName: string | undefined;
let awsHostedZoneId: string | undefined;

let jwtSecretKey: string | undefined;
let systemAdminEmail: string | undefined;
let systemAdminPassword: string | undefined;
let testUserEmail: string | undefined;
let testUserPassword: string | undefined;
let seqeraApiBaseUrl: string;
let devEnv: boolean = true;

if (process.env.CI_CD === 'true') {
  console.log('Loading Back-End environment settings for CI/CD Pipeline...');

  // CI/CD Pipeline uses ENV parameters
  awsAccountId = process.env.AWS_ACCOUNT_ID;
  awsRegion = process.env.AWS_REGION;
  envName = process.env.ENV_NAME;
  envType = process.env.ENV_TYPE;
  appDomainName = process.env.APP_DOMAIN_NAME;
  awsHostedZoneId = process.env.AWS_HOSTED_ZONE_ID;

  jwtSecretKey = process.env.JWT_SECRET_KEY;
  systemAdminEmail = process.env.SYSTEM_ADMIN_EMAIL;
  systemAdminPassword = process.env.SYSTEM_ADMIN_PASSWORD;
  testUserEmail = process.env.TEST_USER_EMAIL;
  testUserPassword = process.env.TEST_USER_PASSWORD;
  seqeraApiBaseUrl = process.env.SEQERA_API_BASE_URL || SEQERA_API_BASE_URL;

  // AWS infrastructure resources can be destroyed only when devEnv is true
  devEnv = envType === 'dev';
  if (!awsAccountId) {
    throw new Error('"AWS_ACCOUNT_ID" undefined, please check the CI/CD environment configuration');
  }
  if (!awsRegion) {
    throw new Error('"AWS_REGION" undefined, please check the CI/CD environment configuration');
  }
  if (!envName) {
    throw new Error('"ENV_NAME" undefined, please check the CI/CD environment configuration');
  }
  if (!envType) {
    throw new Error('"ENV_TYPE" undefined, please check the CI/CD environment configuration');
  }
  if (!appDomainName) {
    throw new Error('"APP_DOMAIN_NAME" undefined, please check the CI/CD environment configuration');
  }
  if (!devEnv && !awsHostedZoneId) {
    throw new Error('"AWS_HOSTED_ZONE_ID" undefined, please check the CI/CD environment configuration');
  }
  if (devEnv) {
    if (!testUserEmail) {
      throw new Error('"TEST_USER_EMAIL" undefined, please check the CI/CD environment configuration');
    }
    if (!testUserPassword) {
      throw new Error('"TEST_USER_PASSWORD" undefined, please check the CI/CD environment configuration');
    }
  }
} else {
  console.log('Loading Back-End easy-genomics.yaml settings...');

  let configSettings: ConfigurationSettings | undefined;
  const configurations: { [p: string]: ConfigurationSettings }[] = loadConfigurations(
    join(__dirname, '../../../config/easy-genomics.yaml'),
  );
  if (configurations.length === 0) {
    throw new Error('Easy Genomics Configuration missing / invalid, please update: easy-genomics.yaml');
  } else if (configurations.length > 1) {
    throw new Error('Too many Easy Genomics Configurations found, please update: easy-genomics.yaml');
  } else {
    const configuration: { [p: string]: ConfigurationSettings } | undefined = configurations.shift();

    if (configuration) {
      envName = Object.keys(configuration).shift();
      configSettings = Object.values(configuration).shift();
    }
  }

  if (!envName || !configSettings) {
    throw new Error('Easy Genomics Configuration missing / invalid, please check the easy-genomics.yaml configuration');
  }

  // Shared configuration settings
  awsAccountId = configSettings['aws-account-id'].toString();
  awsRegion = configSettings['aws-region'];
  envType = configSettings['env-type']; // dev | pre-prod | prod
  appDomainName = configSettings['app-domain-name'];
  awsHostedZoneId = configSettings['aws-hosted-zone-id'];

  // Back-End configuration settings
  jwtSecretKey = configSettings['back-end']['jwt-secret-key'];
  systemAdminEmail = configSettings['back-end']['system-admin-email'];
  systemAdminPassword = configSettings['back-end']['system-admin-password'];
  testUserEmail = configSettings['back-end']['test-user-email'];
  testUserPassword = configSettings['back-end']['test-user-password'];
  seqeraApiBaseUrl = configSettings['back-end']['seqera-api-base-url'] || SEQERA_API_BASE_URL;

  // AWS infrastructure resources can be destroyed only when devEnv is true
  devEnv = envType === 'dev';
  if (!awsAccountId) {
    throw new Error('"AWS_ACCOUNT_ID" undefined, please check the easy-genomics.yaml configuration');
  }
  if (!awsRegion) {
    throw new Error('"aws-region" undefined, please check the easy-genomics.yaml configuration');
  }
  if (!envName) {
    throw new Error('"env-name" undefined, please check the easy-genomics.yaml configuration');
  }
  if (!envType) {
    throw new Error('"env-type" undefined, please check the easy-genomics.yaml configuration');
  }
  if (!appDomainName) {
    throw new Error('"app-domain-name" undefined, please check the easy-genomics.yaml configuration');
  }
  if (!devEnv && !awsHostedZoneId) {
    throw new Error('"aws-hosted-zone-id" undefined, please check the easy-genomics.yaml configuration');
  }
  if (devEnv) {
    if (!testUserEmail) {
      throw new Error('"test-user-email" undefined, please check the easy-genomics.yaml configuration');
    }
    if (!testUserPassword) {
      throw new Error('"test-user-password" undefined, please check the easy-genomics.yaml configuration');
    }
  }
}

const namePrefix: string = envType === 'prod' ? `${envType}` : `${envType}-${envName}`;
const constructNamespace: string = `${namePrefix}-easy-genomics`;

// Setups Back-End Stack which initiates the nested stacks for Auth, Easy Genomics, AWS HealthOmics and NextFlow Tower
new BackEndStack(app, `${envName}-main-back-end-stack`, {
  env: {
    account: awsAccountId,
    region: awsRegion,
  },
  constructNamespace: constructNamespace,
  devEnv: devEnv,
  envName: envName,
  envType: envType,
  appDomainName: appDomainName,
  awsHostedZoneId: awsHostedZoneId,
  namePrefix: namePrefix,
  // Generate random value for JWT signature secret on deployment if jwt-secret-key configuration undefined
  jwtSecretKey: jwtSecretKey ? jwtSecretKey : randomUUID(),
  systemAdminEmail: systemAdminEmail,
  systemAdminPassword: systemAdminPassword,
  testUserEmail: testUserEmail,
  testUserPassword: testUserPassword,
  seqeraApiBaseUrl: seqeraApiBaseUrl.replace(/\/+$/, ''), // Remove trailing slashes
});

app.synth();
