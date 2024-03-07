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

    const envType: string = process.env.ENV_TYPE!.trim().toLowerCase();
    const subDomain: string = process.env.SUB_DOMAIN!.trim().toLowerCase();
    const domainName: string = process.env.DOMAIN_NAME!.trim().toLowerCase();
    const applicationUri: string = envType === 'prod' ? `${subDomain}.${domainName}` : `${subDomain}.${envType}.${domainName}`;
    const hostedZoneId: string = process.env.HOSTED_ZONE_ID!.trim();
    const hostedZoneName: string = process.env.HOSTED_ZONE_NAME!.trim().toLowerCase();
    const certificateArn: string = process.env.CERTIFICATE_ARN!.trim();

    if (validateEasyGenomicsEnvType(envType)) {
      // AWS infrastructure resources can be destroyed only when devEnv is true
      const devEnv: boolean = envType === 'dev';
      const namePrefix: string = envType === 'prod' ? `${envType}` : `${envType}-${subDomain}`;

      // Setups Front-End Stack to support static web hosting for the UI
      new FrontEndStack(app, `${subDomain}-main-front-end-stack`, {
        constructNamespace: `${subDomain}-easy-genomics`,
        env: {
          account: process.env.AWS_ACCOUNT_ID!,
          region: process.env.AWS_REGION!,
        },
        envType: envType,
        devEnv: devEnv,
        lambdaTimeoutInSeconds: 30,
        namePrefix: namePrefix,
        siteDistribution: {
          applicationUri: applicationUri,
          hostedZoneId: hostedZoneId,
          hostedZoneName: hostedZoneName,
          certificateArn: certificateArn,
        },
      });
    }

    app.synth();
  }
}

