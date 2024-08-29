import { join } from 'path';
import { getApiGatewayInfo } from '@easy-genomics/shared-lib/lib/app/utils/api-gateway-utils';
import { getCognitoIdpInfo } from '@easy-genomics/shared-lib/lib/app/utils/cognito-idp-utils';
import { ApiGatewayInfo } from '@easy-genomics/shared-lib/src/app/types/api-gateway-info';
import { CognitoIdpInfo } from '@easy-genomics/shared-lib/src/app/types/cognito-idp-info';
import { ConfigurationSettings } from '@easy-genomics/shared-lib/src/app/types/configuration';
import { loadConfigurations } from '@easy-genomics/shared-lib/lib/app/utils/configuration';
import * as fs from 'fs';

/**
 * This script is required to simplify the easy-genomics.yaml configuration and deployment workflow for customers and
 * for the Easy Genomics development team to easily work on various parts of the system in parallel.
 *
 * This script reads the {easy-genomics root dir}/config/easy-genomics.yaml file for the configured shared settings to
 * then asynchronously queries the relevant AWS services for the existing:
 *  - API Gateway URL
 *  - Cognito IDP User Pool ID
 *  - Cognito IDP User Pool Client ID
 *
 * This information is then saved to the {easy-genomics root dir}/config/.env.nuxt file for Nuxt's nuxt.config.ts
 * to use for the static web content generation.
 *
 * Once the project configuration is able to allow top-level asynchronous calls from either the Front-End main.ts
 * entry point or the nuxt.config.ts entry point, this intermediate script can be deprecated.
 *
 * @param awsRegion
 * @param envName
 * @param envType
 */
export async function exportNuxtConfigurationSettings(awsRegion: string, envName: string, envType: string) {
  const namePrefix: string = envType === 'prod' ? `${envType}` : `${envType}-${envName}`;
  const apiGatewayRestApiName: string = `${namePrefix}-easy-genomics-apigw`;
  const cognitoUserPoolName: string = `${namePrefix}-easy-genomics-auth-user-pool`;
  const cognitoUserPoolClientName: string = `${namePrefix}-easy-genomics-auth-user-pool-client`;

  const apiGatewayInfo: ApiGatewayInfo = await getApiGatewayInfo(apiGatewayRestApiName, awsRegion);
  const cognitoIdpInfo: CognitoIdpInfo = await getCognitoIdpInfo(cognitoUserPoolName, cognitoUserPoolClientName);

  console.log('Retrieve and export Nuxt Configuration Settings...');
  console.log(`  AWS_REGION=${awsRegion}`);
  console.log(`  ENV_NAME=${envName}`);
  console.log(`  ENV_TYPE=${envType}`);
  console.log(`  AWS_API_GATEWAY_URL=${apiGatewayInfo.RestApiUrl}`);
  console.log(`  AWS_COGNITO_USER_POOL_ID=${cognitoIdpInfo.UserPoolId}`);
  console.log(`  AWS_COGNITO_USER_POOL_CLIENT_ID=${cognitoIdpInfo.UserPoolClientId}`);

  const nuxtConfigurationSettings: string =
    '###\n' +
    '# This configuration file is generated by the Front-End nuxt-load-configuration-settings.ts script.\n' +
    '###\n' +
    `AWS_REGION=${awsRegion}\n` +
    `ENV_NAME=${envName}\n` +
    `ENV_TYPE=${envType}\n` +
    `AWS_API_GATEWAY_URL=${apiGatewayInfo.RestApiUrl}\n` +
    `AWS_COGNITO_USER_POOL_ID=${cognitoIdpInfo.UserPoolId}\n` +
    `AWS_COGNITO_USER_POOL_CLIENT_ID=${cognitoIdpInfo.UserPoolClientId}\n`;

  // Write out Nuxt Configuration Settings to {easy-genomics root dir}/config/.env.nuxt
  fs.writeFileSync(join(__dirname, '../../config/.env.nuxt'), nuxtConfigurationSettings, {
    encoding: 'utf8',
    flush: true,
  });
}

// eslint-disable-next-line no-void
void (async () => {
  // @ts-ignore
  const configurations: { [p: string]: ConfigurationSettings }[] = loadConfigurations(
    join(__dirname, '../../config/easy-genomics.yaml'),
  );
  if (configurations.length === 0) {
    throw new Error('Easy Genomics Configuration missing / invalid, please update: easy-genomics.yaml');
  } else if (configurations.length > 1) {
    throw new Error('Too many Easy Genomics Configurations found, please update: easy-genomics.yaml');
  } else {
    const configuration: { [p: string]: ConfigurationSettings } | undefined = configurations.shift();

    if (configuration) {
      const envName = Object.keys(configuration).shift();
      const configSettings = Object.values(configuration).shift();

      if (!envName || !configSettings) {
        throw new Error(
          'Easy Genomics Configuration missing / invalid, please check the easy-genomics.yaml configuration',
        );
      }

      const envType = configSettings['env-type']; // dev | pre-prod | prod
      const awsRegion = configSettings['aws-region'];

      await exportNuxtConfigurationSettings(awsRegion, envName, envType).catch((error) => {
        throw error;
      });
    }
  }
})();
