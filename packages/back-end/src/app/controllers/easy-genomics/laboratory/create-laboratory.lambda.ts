import crypto from 'crypto';
import { ConditionalCheckFailedException, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import {
  CreateLaboratory,
  CreateLaboratorySchema,
} from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '../../../services/easy-genomics/laboratory-service';
import { OrganizationService } from '../../../services/easy-genomics/organization-service';
import { S3Service } from '../../../services/s3-service';
import { SsmService } from '../../../services/ssm-service';

const organizationService = new OrganizationService();
const laboratoryService = new LaboratoryService();
const s3Service = new S3Service();
const ssmService = new SsmService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const currentUserId = event.requestContext.authorizer.claims['cognito:username'];
    // Post Request Body
    const request: CreateLaboratory = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    if (!CreateLaboratorySchema.safeParse(request).success) {
      throw new Error('Invalid request');
    }

    // Validate OrganizationId exists before creating Laboratory
    const organization: Organization = await organizationService.get(request.OrganizationId);
    if (!organization) {
      throw new Error(`Laboratory creation error, OrganizationId '${request.OrganizationId}' not found`);
    }

    const {
      AwsHealthOmicsEnabled: orgAwsHealthOmicsEnabled,
      NextFlowTowerEnabled: orgNextFlowTowerEnabled,
      OrganizationId,
    } = organization;

    const {
      AwsHealthOmicsEnabled,
      Description,
      Name,
      NextFlowTowerAccessToken,
      NextFlowTowerEnabled,
      NextFlowTowerWorkspaceId,
    } = request;

    // Automatically create an S3 Bucket for this Lab based on the Lab name and Lab ID
    const labId: string = crypto.randomUUID().toLowerCase();
    const S3Bucket: string = await createS3Bucket(Name, labId);

    const response = await laboratoryService.add({
      OrganizationId,
      LaboratoryId: labId,
      Name,
      Description,
      Status: 'Active',
      S3Bucket,
      AwsHealthOmicsEnabled: AwsHealthOmicsEnabled || orgAwsHealthOmicsEnabled || false,
      NextFlowTowerEnabled: NextFlowTowerEnabled || orgNextFlowTowerEnabled || false,
      NextFlowTowerWorkspaceId,
      CreatedAt: new Date().toISOString(),
      CreatedBy: currentUserId,
    });

    // Store NextFlow AccessToken in SSM if value supplied
    if (NextFlowTowerAccessToken) {
      await ssmService.putParameter({
        Name: `/easy-genomics/organization/${OrganizationId}/laboratory/${labId}/nf-access-token`,
        Description: `Easy Genomics Laboratory ${labId} NF AccessToken`,
        Value: NextFlowTowerAccessToken,
        Type: 'SecureString',
        Overwrite: false,
      });
    }

    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildResponse(400, JSON.stringify({ Error: getErrorMessage(err) }), event);
  }
};

// Used for customizing error messages by exception types
function getErrorMessage(err: any) {
  if (err instanceof ConditionalCheckFailedException) {
    return 'Laboratory already exists';
  } else if (err instanceof TransactionCanceledException) {
    return 'Laboratory Name already taken';
  } else {
    return err.message;
  }
}

/**
 * Helper function to using Regex to clean up S3 Bucket Name based on the Lab Name
 * to satisfy S3 naming character set requirements (not length requirements):
 *
 * https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html
 *
 * @param labName
 */
function getLabNamePartOfS3BucketName(labName: string): string {
  return labName
    .trim()
    .toLowerCase()
    .replace(/[\s_]/g, '-')
    .replace(/[^a-zA-Z0-9.-]/g, '')
    .replace(/^-+|-+$|-+/g, '-')
    .replace(/^\.+|\.+$|\.+/g, '.');
}

/**
 * Helper function to generate a unique S3 Bucket Name suffix based on the Lab Name
 * and Lab ID, ensuring the S3 Bucket Name is within the maximum allowed length
 * of 63 characters.
 *
 * @param labName
 * @param labId
 * @param maxLength
 */
function getBucketNameSuffix(labName: string, labId: string, maxLength: number): string {
  console.log(
    `Generating unique S3 bucket name lab part; with max length: ${maxLength}; from Lab Name: ${labName} (${labName.length}-chars)`,
  );

  const s3SafeLabName = getLabNamePartOfS3BucketName(labName);
  console.log(
    `S3 safe lab name: ${s3SafeLabName} (${s3SafeLabName.length}-chars); from labName: ${labName} (${labName.length}-chars)`,
  );

  const shortId = labId.split('-')[0].toLowerCase();
  const shortName = s3SafeLabName.substring(0, maxLength - shortId.length - 1);
  const bucketNameSuffix = `${shortName}-${shortId}`;
  const s3SafeBucketNameSuffix = removeMultipleHyphens(bucketNameSuffix);
  console.log(
    `Generated unique S3 safe bucket name suffix: ${s3SafeBucketNameSuffix} (${s3SafeBucketNameSuffix.length}-chars); from shortName: ${shortName} (${shortName.length}-chars); shortId: ${shortId} (${shortId.length}-chars); within max length: ${maxLength}-chars`,
  );

  return bucketNameSuffix;
}

/**
 * Helper function to replace multiple consecutive hyphens with a single hyphen.
 *
 * @param input
 */
function removeMultipleHyphens(input: string): string {
  return input.replace(/-+/g, '-');
}

/**
 * IMPORTANT
 * The IAM policy for this lambda function prevents the creation S3 buckets where
 * the name doesn't begin with the resources prefix in the policy
 * e.g. 123456789012-dev-build2-lab-*
 *
 * @param labName
 * @param labId
 * @returns
 */
async function createS3Bucket(labName: string, labId: string): Promise<string> {
  const bucketNamePrefix = `${process.env.ACCOUNT_ID}-${process.env.NAME_PREFIX}-lab-`;
  console.log(`S3 bucket name prefix: ${bucketNamePrefix} (${bucketNamePrefix.length}-chars)`);

  const maxSuffixLength = 63 - bucketNamePrefix.length;

  const bucketNameSuffix = getBucketNameSuffix(labName, labId, maxSuffixLength);
  const bucketName: string = `${bucketNamePrefix}-${bucketNameSuffix}`;
  const s3SafeBucketName = removeMultipleHyphens(bucketName);
  console.log(`Unique S3 safe bucket name: ${s3SafeBucketName} (${s3SafeBucketName.length}-chars)`);

  // S3 bucket names must between 3 - 63 characters long, and globally unique
  if (s3SafeBucketName.length < 3 || s3SafeBucketName.length > 63) {
    throw new Error(
      `Laboratory creation error, unable to create Laboratory S3 Bucket due to invalid length of bucket name; bucketName: ${s3SafeBucketName} (${s3SafeBucketName.length}-chars) exceeds the max allowed 63-chars`,
    );
  }

  // Create S3 Bucket for Laboratory
  const createS3BucketResult = await s3Service.createBucket({ Bucket: s3SafeBucketName });
  console.log(`S3 bucket created: ${JSON.stringify(createS3BucketResult)}`);

  return s3SafeBucketName;
}
