import { join } from 'path';
import { ConfigurationSettings } from '@easy-genomics/shared-lib/src/app/types/configuration';
import { loadConfigurations } from '@easy-genomics/shared-lib/src/app/utils/configuration';
import { App } from 'aws-cdk-lib';
import { FrontEndStack } from './infra/stacks/front-end-stack';

const app = new App();

if (process.env.CI_CD === 'true') {
  console.log('Loading Front-End CI/CD Pipeline settings...');

  // CI/CD Pipeline uses ENV parameters
  const awsAccountId: string | undefined = process.env.AWS_ACCOUNT_ID;
  const awsRegion: string | undefined = process.env.AWS_REGION;
  const awsHostedZoneId: string | undefined = process.env.AWS_HOSTED_ZONE_ID;
  const awsHostedZoneName: string | undefined = process.env.AWS_HOSTED_ZONE_NAME;
  const awsCertificateArn: string | undefined = process.env.AWS_CERTIFICATE_ARN;
  const envName: string | undefined = process.env.ENV_NAME;
  const envType: string | undefined = process.env.ENV_TYPE;
  const applicationUrl: string | undefined = process.env.APPLICATION_URL;

  if (!awsAccountId) throw new Error('ACCOUNT_ID undefined');
  if (!awsRegion) throw new Error('AWS_REGION undefined');
  if (!awsHostedZoneId) throw new Error('AWS_HOSTED_ZONE_ID undefined');
  if (!awsHostedZoneName) throw new Error('AWS_HOSTED_ZONE_NAME undefined');
  if (!awsCertificateArn) throw new Error('AWS_CERTIFICATE_ARN undefined');
  if (!envName) throw new Error('ENV_NAME undefined');
  if (!envType) throw new Error('ENV_TYPE undefined');
  if (!applicationUrl) throw new Error('APPLICATION_URL undefined');

  // AWS infrastructure resources can be destroyed only when devEnv is true
  const devEnv: boolean = envType === 'dev';
  const constructNamespace: string = `${envName}-easy-genomics`;

  // Setups Front-End Stack to support static web hosting for the UI
  new FrontEndStack(app, `${envName}-main-front-end-stack`, {
    env: {
      account: awsAccountId,
      region: awsRegion,
    },
    constructNamespace: constructNamespace,
    devEnv: devEnv,
    envName: envName,
    envType: envType,
    applicationUrl: applicationUrl,
    certificateArn: awsCertificateArn,
    hostedZoneId: awsHostedZoneId,
    hostedZoneName: awsHostedZoneName,
  });
} else {
  console.log('Loading Front-End easy-genomics.yaml settings...');

  const configurations: { [p: string]: ConfigurationSettings }[] = loadConfigurations(join(__dirname, '../../../config/easy-genomics.yaml'));
  if (configurations.length === 0) {
    throw new Error('Easy Genomics Configuration(s) missing / invalid, please update: easy-genomics.yaml');
  }

  // Iterate through valid configurations to synthesize CloudFormation stacks
  configurations.map((configuration: { [p: string]: ConfigurationSettings }) => {
    const envName: string | undefined = Object.keys(configuration).shift();
    const configSettings: ConfigurationSettings | undefined = Object.values(configuration).shift();

    if (envName && configSettings) {
      const awsAccountId: string = configSettings['aws-account-id'].toString();
      const awsRegion: string = configSettings['aws-region'];
      const envType: string = configSettings['env-type']; // dev | pre-prod | prod
      const applicationUrl: string = configSettings['application-url'];

      const awsHostedZoneId: string = configSettings['front-end']['aws-hosted-zone-id'];
      const awsHostedZoneName: string = configSettings['front-end']['aws-hosted-zone-name'];
      const awsCertificateArn: string = configSettings['front-end']['aws-certificate-arn'];

      // AWS infrastructure resources can be destroyed only when devEnv is true
      const devEnv: boolean = envType === 'dev';
      const constructNamespace: string = `${envName}-easy-genomics`;

      // Setups Front-End Stack to support static web hosting for the UI
      new FrontEndStack(app, `${envName}-main-front-end-stack`, {
        env: {
          account: awsAccountId,
          region: awsRegion,
        },
        constructNamespace: constructNamespace,
        devEnv: devEnv,
        envName: envName,
        envType: envType,
        applicationUrl: applicationUrl,
        certificateArn: awsCertificateArn,
        hostedZoneId: awsHostedZoneId,
        hostedZoneName: awsHostedZoneName,
      });
    }
  });
}

app.synth();