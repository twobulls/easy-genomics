import * as yaml from 'js-yaml';
import { readFileSync } from 'fs';
import { ConfigService } from '@nestjs/config';
import { Configuration, ConfigurationSettings } from '../types/configuration';
import { ConfigurationSettingsSchema } from '../schema/configuration';

/**
 * Shared function to load the specified configuration file settings.
 * @param filePath
 */
export function loadConfigurations(filePath: string): {[p: string]: ConfigurationSettings}[] {
  const yamlConfigs: Record<string, any> = loadYamlConfigFile(filePath);
  const configService = new ConfigService(yamlConfigs);

  const configurations: Configuration[] | undefined = configService.get<Configuration[]>('easy-genomics.configurations');
  if (!configurations) {
    throw new Error('Easy Genomics Configuration(s) missing / invalid');
  }

  return loadValidConfigurations(configurations);
}

/**
 * Private function reading specified YAML configuration file.
 * @param filePath
 */
function loadYamlConfigFile(filePath: string): Record<string, any> {
  return yaml.load(readFileSync(filePath, 'utf8')) as Record<string, any>;
};

/**
 * Private function returning only validated ConfigurationSettings.
 * @param configurations
 */
function loadValidConfigurations(configurations: Configuration[]): {[p: string]: ConfigurationSettings}[] {
  const validConfigurations: ({[p: string]: ConfigurationSettings} | null)[] = configurations.map(config => {
    const envName: string | undefined = Object.keys(config).shift();
    const configurationSettings: ConfigurationSettings | undefined = Object.values(config).shift();

    if (envName && configurationSettings) {
      if (ConfigurationSettingsSchema.safeParse(configurationSettings).success) {
        return { [envName]: configurationSettings };
      }
    }
    return null;
  });

  // Return only validated configurations
  return validConfigurations.flatMap(c => !!c ? [c] : []);
}
