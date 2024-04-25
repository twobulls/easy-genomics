import { join } from 'path';
import { ConfigurationSettings } from '@easy-genomics/shared-lib/src/app/types/configuration';
import { loadConfigurations } from '@easy-genomics/shared-lib/src/app/utils/configuration';
import { App } from 'aws-cdk-lib';
import { BackEndStack } from './infra/stacks/back-end-stack';

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
      const envType: string = configSettings['env-type']; // dev | pre-prod | prod
      const applicationUrl: string = configSettings['application-url'];

      const systemAdminEmail: string = configSettings['back-end']['system-admin-email'];

      // AWS infrastructure resources can be destroyed only when devEnv is true
      const devEnv: boolean = envType === 'dev';
      const namePrefix: string = envType === 'prod' ? `${envType}` : `${envType}-${envName}`;
      const constructNamespace: string = `${envName}-easy-genomics`;

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
      });
    }
  });

  app.synth();
}
