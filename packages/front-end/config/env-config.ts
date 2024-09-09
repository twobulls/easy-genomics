import { join } from 'path';
import {
  findConfiguration,
  getStackEnvName,
  loadConfigurations,
} from '@easy-genomics/shared-lib/src/app/utils/configuration';
import { ConfigurationSettings } from '@easy-genomics/shared-lib/src/app/types/configuration';
/**
 * Extracts the configuration settings for the current environment from the master YAML configuration
 */
function getConfigurationSettings(): ConfigurationSettings {
  // Load the configurations from the file
  const configurations = loadConfigurations(join(__dirname, '@/config/easy-genomics.yaml'));

  if (configurations.length === 0) {
    throw new Error('Easy Genomics Configuration(s) missing / invalid, please update: easy-genomics.yaml');
  }

  // Determine the stack environment name
  const stackEnvName = getStackEnvName();

  if (configurations.length > 1 && !stackEnvName) {
    throw new Error('Multiple configurations found in easy-genomics.yaml, please specify argument: --stack {env-name}');
  }

  // Find or select the appropriate configuration
  const configuration =
    configurations.length > 1 ? findConfiguration(stackEnvName!, configurations) : configurations[0];

  // Extract and validate the environment configuration
  const envConfig = Object.values(configuration)[0];

  if (!envConfig) {
    throw new Error('Easy Genomics Configuration(s) missing / invalid, please update: easy-genomics.yaml');
  }

  return envConfig;
}

export const envConfig = getConfigurationSettings();
