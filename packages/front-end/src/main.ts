import { join } from 'path';
import { ConfigurationSettings } from '@easy-genomics/shared-lib/src/app/types/configuration';
import { loadConfigurations } from '@easy-genomics/shared-lib/src/app/utils/configuration';
import { App } from 'aws-cdk-lib';
import { FrontEndStack } from './infra/stacks/front-end-stack';

const app = new App();

if (process.env.CI_CD === 'true') {
  console.log('Loading Front-End environment settings for CI/CD Pipeline...');

  // CI/CD Pipeline uses ENV parameters
  const envName: string | undefined = process.env.ENV_NAME;
  const awsAccountId: string | undefined = process.env.AWS_ACCOUNT_ID;
  const awsRegion: string | undefined = process.env.AWS_REGION;
  const envType: string | undefined = process.env.ENV_TYPE;
  const appDomainName: string | undefined = process.env.APP_DOMAIN_NAME;
  const awsHostedZoneId: string | undefined = process.env.AWS_HOSTED_ZONE_ID;

  const awsApiGatewayUrl: string | undefined = process.env.AWS_API_GATEWAY_URL;
  const awsCognitoUserPoolId: string | undefined = process.env.AWS_COGNITO_USER_POOL_ID;
  const awsCognitoUserPoolClientId: string | undefined = process.env.AWS_COGNITO_USER_POOL_CLIENT_ID;
  const awsCertificateArn: string | undefined = process.env.AWS_CERTIFICATE_ARN;

  // AWS infrastructure resources can be destroyed only when devEnv is true
  const devEnv: boolean = envType === 'dev';

  if (!envName) throw new Error('ENV_NAME undefined, please check the CI/CD environment configuration');
  if (!awsAccountId) throw new Error('AWS_ACCOUNT_ID undefined, please check the CI/CD environment configuration');
  if (!awsRegion) throw new Error('AWS_REGION undefined, please check the CI/CD environment configuration');
  if (!envType) throw new Error('ENV_TYPE undefined, please check the CI/CD environment configuration');
  if (!appDomainName) throw new Error('APP_DOMAIN_NAME undefined, please check the CI/CD environment configuration');
  if (!devEnv && !awsHostedZoneId) {
    throw new Error('AWS_HOSTED_ZONE_ID undefined, please check the CI/CD environment configuration');
  }

  if (!awsApiGatewayUrl) {
    throw new Error('AWS_API_GATEWAY_URL undefined, please check the CI/CD environment configuration');
  }
  if (!awsCognitoUserPoolId) {
    throw new Error('AWS_COGNITO_USER_POOL_ID undefined, please check the CI/CD environment configuration');
  }
  if (!awsCognitoUserPoolClientId) {
    throw new Error('AWS_COGNITO_USER_POOL_CLIENT_ID undefined, please check the CI/CD environment configuration');
  }
  if (!devEnv && !awsCertificateArn) {
    throw new Error('AWS_CERTIFICATE_ARN undefined, please check the CI/CD environment configuration');
  }

  const constructNamespace: string = `${envName}-easy-genomics`;

  // Setups Front-End Stack to support static web hosting for the UI

  new FrontEndStack(app, `${envName}-main-front-end-stack`, {
    env: {
      account: awsAccountId,
      region: awsRegion,
    },
    constructNamespace,
    devEnv,
    envName,
    envType,
    appDomainName,
    awsHostedZoneId,
    awsCertificateArn,
  });
} else {
  console.log('Loading Front-End easy-genomics.yaml settings...');

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
      const awsAccountId: string = configSettings['aws-account-id'].toString();
      const awsRegion: string = configSettings['aws-region'];
      const envType: string = configSettings['env-type']; // dev | pre-prod | prod
      const appDomainName: string = configSettings['app-domain-name'];
      const awsHostedZoneId: string | undefined = configSettings['aws-hosted-zone-id'];

      // Front-End configuration settings
      const awsApiGatewayUrl: string | undefined = configSettings['front-end']['aws-api-gateway-url'];
      const awsCognitoUserPoolId: string | undefined = configSettings['front-end']['aws-cognito-user-pool-id'];
      const awsCognitoUserPoolClientId: string | undefined =
        configSettings['front-end']['aws-cognito-user-pool-client-id'];

      const awsCertificateArn: string | undefined = configSettings['front-end']['aws-certificate-arn'];

      // AWS infrastructure resources can be destroyed only when devEnv is true
      const devEnv: boolean = envType === 'dev';
      const constructNamespace: string = `${envName}-easy-genomics`;

      if (!awsApiGatewayUrl) {
        throw new Error('"aws-api-gateway-url" undefined, please check the easy-genomics.yaml configuration');
      }
      if (!awsCognitoUserPoolId) {
        throw new Error('"aws-cognito-user-pool-id" undefined, please check the easy-genomics.yaml configuration');
      }
      if (!awsCognitoUserPoolClientId) {
        throw new Error(
          '"aws-cognito-user-pool-client-id" undefined, please check the easy-genomics.yaml configuration',
        );
      }
      if (!devEnv && !awsHostedZoneId) {
        throw new Error('"aws-hosted-zone-id" undefined, please check the easy-genomics.yaml configuration');
      }
      if (!devEnv && !awsCertificateArn) {
        throw new Error('"aws-certificate-arn" undefined, please check the easy-genomics.yaml configuration');
      }

      // Setups Front-End Stack to support static web hosting for the UI

      new FrontEndStack(app, `${envName}-main-front-end-stack`, {
        env: {
          account: awsAccountId,
          region: awsRegion,
        },
        constructNamespace,
        devEnv,
        envName,
        envType,
        appDomainName,
        awsHostedZoneId,
        awsCertificateArn,
      });
    }
  });
}

app.synth();
