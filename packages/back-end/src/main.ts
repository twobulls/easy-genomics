import { randomUUID } from 'crypto';
import { join } from 'path';
import { ConfigurationSettings } from '@easy-genomics/shared-lib/src/app/types/configuration';
import { loadConfigurations } from '@easy-genomics/shared-lib/src/app/utils/configuration';
import { App } from 'aws-cdk-lib';
import { BackEndStack } from './infra/stacks/back-end-stack';

const SEQERA_API_BASE_URL = 'https://api.cloud.seqera.io';
const app = new App();

if (process.env.CI_CD === 'true') {
  console.log('Loading Back-End environment settings for CI/CD Pipeline...');
  // CI/CD Pipeline uses ENV parameters
  const awsAccountId: string | undefined = process.env.AWS_ACCOUNT_ID;
  const awsRegion: string | undefined = process.env.AWS_REGION;
  const envName: string | undefined = process.env.ENV_NAME;
  const envType: string | undefined = process.env.ENV_TYPE;
  const appDomainName: string | undefined = process.env.APP_DOMAIN_NAME;
  const awsHostedZoneId: string | undefined = process.env.AWS_HOSTED_ZONE_ID;

  const jwtSecretKey: string | undefined = process.env.JWT_SECRET_KEY;
  const systemAdminEmail: string | undefined = process.env.SYSTEM_ADMIN_EMAIL;
  const systemAdminPassword: string | undefined = process.env.SYSTEM_ADMIN_PASSWORD;
  const testUserEmail: string | undefined = process.env.TEST_USER_EMAIL;
  const testUserPassword: string | undefined = process.env.TEST_USER_PASSWORD;
  const seqeraApiBaseUrl: string = process.env.SEQERA_API_BASE_URL || SEQERA_API_BASE_URL;

  // AWS infrastructure resources can be destroyed only when devEnv is true
  const devEnv: boolean = envType === 'dev';
  const namePrefix: string = envType === 'prod' ? `${envType}` : `${envType}-${envName}`;
  const constructNamespace: string = `${namePrefix}-easy-genomics`;

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
  // Setups Back-End Stack which initiates the nested stacks for Easy Genomics, AWS HealthOmics and NextFlow Tower
  // eslint-disable-next-line no-new
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
    // Generate random value for JWT signature secret on deployment if JWT_SECRET_KEY CI/CD configuration undefined
    jwtSecretKey: jwtSecretKey ? jwtSecretKey : randomUUID(),
    systemAdminEmail: systemAdminEmail,
    systemAdminPassword: systemAdminPassword,
    testUserEmail: testUserEmail,
    testUserPassword: testUserPassword,
    seqeraApiBaseUrl: seqeraApiBaseUrl,
  });
} else {
  console.log('Loading Back-End easy-genomics.yaml settings...');

  const configurations: { [p: string]: ConfigurationSettings }[] = loadConfigurations(
    join(__dirname, '../../../config/easy-genomics.yaml'),
  );
  if (configurations.length === 0) {
    throw new Error('Easy Genomics Configuration(s) missing / invalid, please update: easy-genomics.yaml');
  }

  // Iterate through valid configurations to synthesize CloudFormation stacks
  configurations.forEach((configuration: { [p: string]: ConfigurationSettings }) => {
    const envName: string | undefined = Object.keys(configuration).shift();
    const configSettings: ConfigurationSettings | undefined = Object.values(configuration).shift();

    if (envName && configSettings) {
      // Shared configuration settings
      const awsAccountId: string | undefined = configSettings['aws-account-id'].toString();
      const awsRegion: string | undefined = configSettings['aws-region'];
      const envType: string | undefined = configSettings['env-type']; // dev | pre-prod | prod
      const appDomainName: string | undefined = configSettings['app-domain-name'];
      const awsHostedZoneId: string | undefined = configSettings['aws-hosted-zone-id'];

      // Back-End configuration settings
      const jwtSecretKey: string | undefined = configSettings['back-end']['jwt-secret-key'];
      const systemAdminEmail: string | undefined = configSettings['back-end']['system-admin-email'];
      const systemAdminPassword: string | undefined = configSettings['back-end']['system-admin-password'];
      const testUserEmail: string | undefined = configSettings['back-end']['test-user-email'];
      const testUserPassword: string | undefined = configSettings['back-end']['test-user-password'];
      const seqeraApiBaseUrl: string = configSettings['back-end']['seqera-api-base-url'] || SEQERA_API_BASE_URL;

      // AWS infrastructure resources can be destroyed only when devEnv is true
      const devEnv: boolean = envType === 'dev';
      const namePrefix: string = envType === 'prod' ? `${envType}` : `${envType}-${envName}`;
      const constructNamespace: string = `${namePrefix}-easy-genomics`;

      if (!awsAccountId) {
        throw new Error('"AWS_ACCOUNT_ID" undefined, please check the CI/CD environment configuration');
      }
      if (!awsRegion) throw new Error('"aws-region" undefined, please check the easy-genomics.yaml configuration');
      if (!envName) throw new Error('"env-name" undefined, please check the easy-genomics.yaml configuration');
      if (!envType) throw new Error('"env-type" undefined, please check the easy-genomics.yaml configuration');
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

      // Setups Back-End Stack which initiates the nested stacks for Auth, Easy Genomics, AWS HealthOmics and NextFlow Tower
      // eslint-disable-next-line no-new
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
    }
  });
}

app.synth();
