import { join } from 'path';
import {
  findConfiguration,
  getStackEnvName,
  loadConfigurations,
} from '@easy-genomics/shared-lib/src/app/utils/configuration';
import { ConfigurationSettings } from '@easy-genomics/shared-lib/src/app/types/configuration';

interface EnvConfig {
  appDomainName: string | undefined;
  testUserEmail: string | undefined;
  testUserPassword: string | undefined;
}

/**
 * Extracts the configuration settings for the current environment from the master YAML configuration
 */
function getConfigurationSettings(): EnvConfig {
  let appDomainName: string | undefined;
  let testUserEmail: string | undefined;
  let testUserPassword: string | undefined;

  if (process.env.CI === 'true') {
    // CI/CD Pipeline uses ENV parameters
    appDomainName = process.env.APP_DOMAIN_NAME;
    testUserEmail = process.env.TEST_USER_EMAIL;
    testUserPassword = process.env.TEST_USER_PASSWORD;
  } else {
    // Load the configurations from local configuration file
    const configurations = loadConfigurations(join(__dirname, '../../../config/easy-genomics.yaml'));
    console.log('configurations', configurations);

    if (configurations.length === 0) {
      throw new Error('Easy Genomics Configuration(s) missing / invalid, please update: easy-genomics.yaml');
    }

    // Determine the stack environment name
    const stackEnvName = getStackEnvName();

    if (configurations.length > 1 && !stackEnvName) {
      throw new Error(
        'Multiple configurations found in easy-genomics.yaml, please specify argument: --stack {env-name}',
      );
    }

    // Find or select the appropriate configuration
    const configuration =
      configurations.length > 1 ? findConfiguration(stackEnvName!, configurations) : configurations[0];

    // Extract and validate the environment configuration
    const envConfig = Object.values(configuration)[0];

    if (!envConfig) {
      throw new Error('Easy Genomics Configuration(s) missing / invalid, please update: easy-genomics.yaml');
    }

    appDomainName = envConfig['app-domain-name'];
    testUserEmail = envConfig['back-end']['test-user-email'];
    testUserPassword = envConfig['back-end']['test-user-password'];
  }

  return {
    appDomainName,
    testUserEmail,
    testUserPassword,
  };
}

export const envConfig = getConfigurationSettings();
