import { join } from 'path';
import { ConfigurationSettings } from '@easy-genomics/shared-lib/src/app/types/configuration';
import { loadConfigurations } from '@easy-genomics/shared-lib/src/app/utils/configuration';
import { App } from 'aws-cdk-lib';
import { FrontEndStack } from './infra/stacks/front-end-stack';

const configurations: {[p: string]: ConfigurationSettings}[] = loadConfigurations(join(__dirname, '../../../config/easy-genomics.yaml'));
if (configurations.length === 0) {
  throw new Error('Easy Genomics Configuration(s) missing / invalid');
} else {
  const app = new App();
  // Iterate through valid configurations to synthesize CloudFormation stacks
  configurations.map((configuration: {[p: string]: ConfigurationSettings}) => {
    const envName: string | undefined = Object.keys(configuration).shift();
    const configSettings: ConfigurationSettings | undefined = Object.values(configuration).shift();

    if (envName && configSettings) {
      const awsAccountId: string = configSettings['aws-account-id'].toString();
      const awsRegion: string = configSettings['aws-region'];
      const awsCertificateArn: string = configSettings['aws-certificate-arn'];
      const awsCognitoClientId: string = configSettings['aws-cognito-client-id'];
      const awsCognitoUserPoolId: string = configSettings['aws-cognito-user-pool-id'];
      const awsHostedZoneId: string = configSettings['aws-hosted-zone-id'];
      const awsHostedZoneName: string = configSettings['aws-hosted-zone-name'];
      const constructNamespace: string = `${envName}-easy-genomics`;
      const envType: string = configSettings['env-type']; // dev | pre-prod | prod
      const subDomain: string | undefined = configSettings['sub-domain'];
      const domainName: string = configSettings['domain-name'];
      const applicationUrl: string = envType === 'prod'
        ? (subDomain ? `${subDomain}.${domainName}` : `${domainName}`)
        : `${subDomain}.${envType}.${domainName}`;
      const baseApiUrl: string = configSettings['base-api-url'];

      // AWS infrastructure resources can be destroyed only when devEnv is true
      const devEnv: boolean = envType === 'dev';

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
        baseApiUrl: baseApiUrl,
        certificateArn: awsCertificateArn,
        cognitoClientId: awsCognitoClientId,
        cognitoUserPoolId: awsCognitoUserPoolId,
        hostedZoneId: awsHostedZoneId,
        hostedZoneName: awsHostedZoneName,
      });
    }
  });
  app.synth();
}
