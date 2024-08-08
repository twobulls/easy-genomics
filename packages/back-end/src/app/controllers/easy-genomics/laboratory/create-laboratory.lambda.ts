import { ConditionalCheckFailedException, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import {
  CreateLaboratory,
  CreateLaboratorySchema,
} from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
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

    // Create S3 Bucket with name based on Laboratory Name
    const s3BucketName = getS3BucketGivenName(Name);
    console.log(`S3 Bucket Name: ${s3BucketName}; from Laboratory Name: ${Name}`);
    await createS3Bucket(s3BucketName);

    const laboratoryId: string = uuidv4();

    const response = await laboratoryService.add({
      OrganizationId,
      LaboratoryId: laboratoryId,
      Name,
      Description,
      Status: 'Active',
      S3Bucket: s3BucketName,
      AwsHealthOmicsEnabled: AwsHealthOmicsEnabled || orgAwsHealthOmicsEnabled || false,
      NextFlowTowerEnabled: NextFlowTowerEnabled || orgNextFlowTowerEnabled || false,
      NextFlowTowerWorkspaceId,
      CreatedAt: new Date().toISOString(),
      CreatedBy: currentUserId,
    });

    // Store NextFlow AccessToken in SSM if value supplied
    if (NextFlowTowerAccessToken) {
      await ssmService.putParameter({
        Name: `/easy-genomics/organization/${OrganizationId}/laboratory/${laboratoryId}/nf-access-token`,
        Description: `Easy Genomics Laboratory ${laboratoryId} NF AccessToken`,
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
 * Helper function to using Regex to clean up S3 Bucket Given Name to satisfy S3
 * naming requirements:
 *
 * https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucketnamingrules.html
 *
 * @param s3BucketGivenName
 */
function getS3BucketGivenName(s3BucketGivenName: string): string {
  return s3BucketGivenName
    .trim()
    .toLowerCase()
    .replace(/[\s_]/g, '-')
    .replace(/[^a-zA-Z0-9.-]/g, '')
    .replace(/^-+|-+$|-+/g, '-')
    .replace(/^\.+|\.+$|\.+/g, '.');
}

async function createS3Bucket(s3BucketName: string): Promise<void> {
  const s3BucketFullName: string = `${process.env.ACCOUNT_ID}-${process.env.NAME_PREFIX}-easy-genomics-lab-${s3BucketName}`;
  console.log(`Creating S3 Bucket Full Name: ${s3BucketFullName}; from requested S3 Bucket Name: ${s3BucketName}`);

  // S3 bucket names must between 3 - 63 characters long, and globally unique
  if (s3BucketFullName.length < 3 || s3BucketFullName.length > 63) {
    throw new Error(
      `Laboratory creation error, unable to create Laboratory S3 Bucket due to invalid length of bucket name; s3BucketGivenName: ${s3BucketName} is too long`,
    );
  }

  // Create S3 Bucket for Laboratory
  const createS3BucketResult = await s3Service.createBucket({ Bucket: s3BucketFullName });
  console.log(`S3 Bucket Created: ${JSON.stringify(createS3BucketResult)}`);
}
