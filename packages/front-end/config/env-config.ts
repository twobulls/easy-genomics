import { join } from 'path';
import {
  findConfiguration,
  getStackEnvName,
  loadConfigurations,
} from '@easy-genomics/shared-lib/lib/app/utils/configuration';
import { ConfigurationSettings } from '@easy-genomics/shared-lib/src/app/types/configuration';

/**
 * Extracts the configuration settings for the current environment from the master YAML configuration
 */
const configurations: { [p: string]: ConfigurationSettings }[] = loadConfigurations(
  join(__dirname, '../../../config/easy-genomics.yaml'),
);
if (configurations.length === 0) {
  throw new Error('Easy Genomics Configuration(s) missing / invalid, please update: easy-genomics.yaml');
}

// Try to retrieve optional command argument: --stack {env-name}
const STACK_ENV_NAME: string | undefined = getStackEnvName();
if (configurations.length > 1 && !STACK_ENV_NAME) {
  throw new Error('Multiple configurations found in easy-genomics.yaml, please specify argument: --stack {env-name}');
}

const configuration: { [p: string]: ConfigurationSettings } =
  configurations.length > 1 ? findConfiguration(STACK_ENV_NAME!, configurations) : configurations.shift()!;

export const envConfig = Object.values(configuration).shift();

if (!envConfig) {
  throw new Error('Easy Genomics Configuration(s) missing / invalid, please update: easy-genomics.yaml');
}
