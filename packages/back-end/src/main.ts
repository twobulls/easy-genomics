import { join } from 'path';
import { ConfigurationSettings } from '@easy-genomics/shared-lib/src/app/types/configuration';
import { loadConfigurations } from '@easy-genomics/shared-lib/src/app/utils/configuration';
import { App } from 'aws-cdk-lib';
import { BackEndStack } from './infra/stacks/back-end-stack';

const app = new App();

if (process.env.CI_CD === 'true') {
  console.log('Loading Back-End environment settings for CI/CD Pipeline...');

  // CI/CD Pipeline uses ENV parameters
  const awsAccountId: string | undefined = process.env.AWS_ACCOUNT_ID;
  const awsRegion: string | undefined = process.env.AWS_REGION;
  const envName: string | undefined = process.env.ENV_NAME;
  const envType: string | undefined = process.env.ENV_TYPE;
  const applicationUrl: string | undefined = process.env.APPLICATION_URL;
  const systemAdminEmail: string | undefined = process.env.SYSTEM_ADMIN_EMAIL;
  const systemAdminPassword: string | undefined = process.env.SYSTEM_ADMIN_PASSWORD;

  if (!awsAccountId) throw new Error('AWS_ACCOUNT_ID undefined, please check the CI/CD environment configuration');
  if (!awsRegion) throw new Error('AWS_REGION undefined, please check the CI/CD environment configuration');
  if (!envName) throw new Error('ENV_NAME undefined, please check the CI/CD environment configuration');
  if (!envType) throw new Error('ENV_TYPE undefined, please check the CI/CD environment configuration');
  if (!applicationUrl) throw new Error('APPLICATION_URL undefined, please check the CI/CD environment configuration');
  if (!systemAdminEmail) throw new Error('SYSTEM_ADMIN_EMAIL undefined, please check the CI/CD environment configuration');
  if (!systemAdminPassword) throw new Error('SYSTEM_ADMIN_PASSWORD undefined, please check the CI/CD environment configuration');

  // AWS infrastructure resources can be destroyed only when devEnv is true
  const devEnv: boolean = envType === 'dev';
  const namePrefix: string = envType === 'prod' ? `${envType}` : `${envType}-${envName}`;
  const constructNamespace: string = `${namePrefix}-easy-genomics`;

  // Setups Back-End Stack which initiates the nested stacks for Easy Genomics, AWS HealthOmics and NextFlow Tower
  new BackEndStack(app, `${envName}-main-back-end-stack`, {
    env: {
      account: awsAccountId,
      region: awsRegion,
    },
    constructNamespace: constructNamespace,
    devEnv: devEnv,
    envName: envName,
    envType: envType,
    applicationUrl: applicationUrl,
    namePrefix: namePrefix,
    systemAdminEmail: systemAdminEmail,
    systemAdminPassword: systemAdminPassword,
  });
} else {
  console.log('Loading Back-End easy-genomics.yaml settings...');

  const configurations: {[p: string]: ConfigurationSettings}[] = loadConfigurations(join(__dirname, '../../../config/easy-genomics.yaml'));
  if (configurations.length === 0) {
    throw new Error('Easy Genomics Configuration(s) missing / invalid, please update: easy-genomics.yaml');
  }

  // Iterate through valid configurations to synthesize CloudFormation stacks
  configurations.map((configuration: {[p: string]: ConfigurationSettings}) => {
    const envName: string | undefined = Object.keys(configuration).shift();
    const configSettings: ConfigurationSettings | undefined = Object.values(configuration).shift();

    if (envName && configSettings) {
      const awsAccountId: string = configSettings['aws-account-id'].toString();
      const awsRegion: string = configSettings['aws-region'];
      const envType: string = configSettings['env-type']; // dev | pre-prod | prod
      const applicationUrl: string = configSettings['application-url'];

      const systemAdminEmail: string = configSettings['back-end']['system-admin-email'];
      const systemAdminPassword: string = configSettings['back-end']['system-admin-password'];

      // AWS infrastructure resources can be destroyed only when devEnv is true
      const devEnv: boolean = envType === 'dev';
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
        applicationUrl: applicationUrl,
        namePrefix: namePrefix,
        systemAdminEmail: systemAdminEmail,
        systemAdminPassword: systemAdminPassword,
      });
    }
  });
}

app.synth();