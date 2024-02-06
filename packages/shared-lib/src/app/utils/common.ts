import { aws_apigateway } from 'aws-cdk-lib';
import { APIGatewayProxyWithCognitoAuthorizerEvent, APIGatewayProxyResult } from 'aws-lambda';

/**
 * Shared function to consistently validate the environmental settings required by the Front-End and Back-End subprojects.
 * @param process
 */
export function validateEasyGenomicsEnvSettings(process: NodeJS.Process): boolean {
  if (!process.env.ENV_NAME) throw new Error('ENV_NAME setting is required'); // e.g. local, sandbox, dev, uat, stage, demo, prod
  if (!process.env.AWS_ACCOUNT_ID) throw new Error('AWS_ACCOUNT_ID setting is required');
  if (!process.env.AWS_REGION) throw new Error('AWS_REGION setting is required');
  if (!process.env.DOMAIN_NAME) throw new Error('DOMAIN_NAME setting is required');
  if (!process.env.HOSTED_ZONE_ID) throw new Error('HOSTED_ZONE_ID setting is required');
  if (!process.env.HOSTED_ZONE_NAME) throw new Error('HOSTED_ZONE_NAME setting is required');
  if (!process.env.CERTIFICATE_ARN) throw new Error('CERTIFICATE_ARN setting is required');

  return true;
}

/**
 * This defines the AWS Regions which Easy Genomics can be deployed to,
 * reflecting the availability of AWS HealthOmics in these regions.
 */
export enum AWS_REGIONS {
  US_EAST_1 = 'us-east-1', // US East (Virginia)
  US_WEST_2 = 'us-west-2', // US West (Oregon)
  AP_SOUTHEAST_1 = 'ap-southeast-1', // Asia Pacific (Singapore)
  EU_CENTRAL_1 = 'eu-central-1', // Europe (Frankfurt)
  EU_WEST_1 = 'eu-west-1', // Europe (Ireland)
  EU_WEST_2 = 'eu-west-2', // Europe (London)
}

/**
 * Shared function to consistently validate Easy Genomics is restricted to AWS regions that supports AWS HealthOmics.
 * This is currently limited to:
 *  - us-east-1 // US East (Virginia)
 *  - us-west-2 // US West (Oregon)
 *  - ap-southeast-1 // Asia Pacific (Singapore)
 *  - eu-central-1  // Europe (Frankfurt)
 *  -  eu-west-1 // Europe (Ireland)
 *  - eu-west-2 // Europe (London)
 */
export function validateEasyGenomicsAwsRegion(awsRegion: string): boolean {
  if (Object.values(AWS_REGIONS).find((value: string) => value === awsRegion)) {
    console.log(`Easy Genomics configured AWS_REGION: ${awsRegion} is valid - PASS`);
    return true;
  } else {
    throw new Error(`Easy Genomics configured AWS_REGION: ${awsRegion} is not supported - FAILED`);
  }
}

/**
 * This defines the allowed access control headers.
 */
export const ACCESS_CONTROL_ALLOW_HEADERS = [
  'Access-Control-Allow-Credentials',
  'Access-Control-Allow-Origin',
  'Authorization',
  'Content-Type',
  'X-Amz-Date',
  'X-Amz-Security-Token',
  'X-Api-Key',
];

export function buildResponse(
  statusCode: number,
  body: string,
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): APIGatewayProxyResult {
  return {
    statusCode,
    body,
    headers: {
      'Access-Control-Allow-Origin': event.headers?.origin || '*',
      'Access-Control-Allow-Methods': aws_apigateway.Cors.ALL_METHODS.join(','),
      'Access-Control-Allow-Headers': ACCESS_CONTROL_ALLOW_HEADERS.join(','),
    },
  };
}

// Generic associative array
export interface AssociativeArray<Type> {
  [key: string]: Type;
}

/**
 * Make all properties in T optional except for keys U
 *
 * @typeParam T - The object to make partial
 * @typeParam U - The keys of T for which to keep previous optionality
 */
export type SomePartial<T extends Record<string, any>, U extends keyof T> = Pick<T, U> & Partial<Omit<T, U>>;
