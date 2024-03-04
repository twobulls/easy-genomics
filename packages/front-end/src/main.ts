import {
  validateEasyGenomicsAwsRegion,
  validateEasyGenomicsEnvSettings,
  validateEasyGenomicsEnvType,
} from '@easy-genomics/shared-lib/src/app/utils/common';
import { App } from 'aws-cdk-lib';
import dotenv from 'dotenv';
import { FrontEndStack } from './infra/stacks/front-end-stack';
// eslint-disable-next-line import/no-extraneous-dependencies
dotenv.config({ path: '.env.local', override: true });

// Validate required Easy Genomics environment settings
if (validateEasyGenomicsEnvSettings(process)) {
  // AWS HealthOmics is not available in all regions, so only allow Easy Genomics
  // web application to be deployed to AWS regions that support AWS HealthOmics.
  if (validateEasyGenomicsAwsRegion(process.env.AWS_REGION!)) {
    const app = new App();

    const appName: string = process.env.APP_NAME!.trim().toLowerCase();
    const envType: string = process.env.ENV_TYPE!.trim().toLowerCase();
    const domainName: string = process.env.DOMAIN_NAME!.trim().toLowerCase();
    const applicationUri: string = envType === 'prod' ? `${appName}.${domainName}` : `${appName}.${envType}.${domainName}`;


    if (validateEasyGenomicsEnvType(envType)) {
      // AWS infrastructure resources can be destroyed only when devEnv is true
      const devEnv: boolean = envType === 'dev';

      // Setups Front-End Stack to support static web hosting for the UI
      new FrontEndStack(app, `${envType}-front-end-stack`, {
        constructNamespace: `${envType}-easy-genomics`,
        env: {
          account: process.env.AWS_ACCOUNT_ID!,
          region: process.env.AWS_REGION!,
        },
        envType: envType,
        devEnv: devEnv,
        lambdaTimeoutInSeconds: 30,
        siteDistribution: {
          applicationUri: applicationUri,
        },
      });
    }

    app.synth();
  }
}

