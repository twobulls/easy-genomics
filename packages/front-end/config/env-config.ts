import { join } from 'path';
import {
  findConfiguration,
  getStackEnvName,
  loadConfigurations,
} from '@easy-genomics/shared-lib/src/app/utils/configuration';

/**
 * Extracts the configuration settings for the current environment from the master YAML configuration
 */
const getAppDomainName = (): string => {
  let domainName: string | undefined;

  console.log(process.env);
  console.log(process.env.CI_CD);

  if (process.env.CI_CD === 'true') {
    // CI/CD Pipeline uses ENV parameters
    domainName = process.env.APP_DOMAIN_NAME;
    if (!domainName) {
      throw new Error('APP_DOMAIN_NAME is not set in the environment variables.');
    }
  } else {
    // Load the configurations from the file
    const configPath = join(__dirname, '../../../config/easy-genomics.yaml');
    const configurations = loadConfigurations(configPath);

    if (configurations.length === 0) {
      throw new Error(`Easy Genomics Configuration(s) missing or invalid in: ${configPath}`);
    }

    // Determine the stack environment name
    const stackEnvName = getStackEnvName();

    if (configurations.length > 1 && !stackEnvName) {
      throw new Error(
        'Multiple configurations found in easy-genomics.yaml, please specify the argument: --stack {env-name}',
      );
    }

    // Find or select the appropriate configuration
    const configuration =
      configurations.length > 1 ? findConfiguration(stackEnvName!, configurations) : configurations[0];

    domainName = configuration['app-domain-name'].toString();

    if (!domainName) {
      throw new Error('app-domain-name is not defined in the selected configuration.');
    }
  }

  return domainName;
};

export const appDomainName = getAppDomainName();
