import { validateEasyGenomicsAwsRegion, validateEasyGenomicsEnvSettings } from '@easy-genomics/shared-lib/src/app/utils/common';
import { App } from 'aws-cdk-lib';
import dotenv from 'dotenv';
import { BackEndStack } from './infra/stacks/back-end-stack';
// eslint-disable-next-line import/no-extraneous-dependencies
dotenv.config({ path: '.env.local', override: true });

// Validate required Easy Genomics environment settings
if (validateEasyGenomicsEnvSettings(process)) {
  // AWS HealthOmics is not available in all regions, so only allow Easy Genomics
  // web application to be deployed to AWS regions that support AWS HealthOmics.
  if (validateEasyGenomicsAwsRegion(process.env.AWS_REGION!)) {
    const app = new App();

    const envName = process.env.ENV_NAME!.trim().toLowerCase();
    const devEnv: boolean = envName === 'local' || envName === 'sandbox' || envName === 'dev';
    const domainName = envName === 'prod' ? process.env.DOMAIN_NAME!.trim().toLowerCase() : `${envName}-${process.env.DOMAIN_NAME!.trim().toLowerCase()}`;

    // Setups Back-End Stack which initiates the nested stacks for Easy Genomics, AWS HealthOmics and NextFlow Tower
    new BackEndStack(app, `${envName}-back-end-stack`, {
      constructNamespace: `${envName}-easy-genomics`,
      env: {
        account: process.env.AWS_ACCOUNT_ID!,
        region: process.env.AWS_REGION!,
      },
      envName: envName,
      devEnv: devEnv,
      lambdaTimeoutInSeconds: 30,
      siteDistribution: {
        domainName: domainName,
        hostedZoneId: process.env.HOSTED_ZONE_ID!,
        hostedZoneName: process.env.HOSTED_ZONE_NAME!,
        certificateArn: process.env.CERTIFICATE_ARN!,
      },
    });

    app.synth();
  }
}
