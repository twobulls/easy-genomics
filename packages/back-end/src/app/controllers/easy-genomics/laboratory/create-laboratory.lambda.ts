import * as crypto from 'crypto';
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

    const s3BucketGivenName: string | undefined = request.S3Bucket;
    if (s3BucketGivenName) {
      await createS3Bucket(s3BucketGivenName);
    }

    const laboratoryId: string = uuidv4();

    const response = await laboratoryService.add({
      OrganizationId: request.OrganizationId,
      LaboratoryId: laboratoryId,
      Name: request.Name,
      Description: request.Description,
      Status: 'Active',
      S3Bucket: s3BucketGivenName,
      AwsHealthOmicsEnabled: request.AwsHealthOmicsEnabled || organization.AwsHealthOmicsEnabled || false,
      NextFlowTowerEnabled: request.NextFlowTowerEnabled || organization.NextFlowTowerEnabled || false,
      NextFlowTowerWorkspaceId: request.NextFlowTowerWorkspaceId,
      CreatedAt: new Date().toISOString(),
      CreatedBy: currentUserId,
    });

    // Store NextFlow AccessToken in SSM if value supplied
    if (request.NextFlowTowerAccessToken) {
      await ssmService.putParameter({
        Name: `/easy-genomics/organization/${request.OrganizationId}/laboratory/${laboratoryId}/nf-access-token`,
        Description: `Easy Genomics Laboratory ${laboratoryId} NF AccessToken`,
        Value: request.NextFlowTowerAccessToken,
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

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  if (err instanceof ConditionalCheckFailedException) {
    return 'Laboratory already exists';
  } else if (err instanceof TransactionCanceledException) {
    return 'Laboratory Name already taken';
  } else {
    return err.message;
  }
}

async function createS3Bucket(s3BucketGivenName: string) {
  const s3BucketFullName: string = `${process.env.ACCOUNT_ID}-${process.env.NAME_PREFIX}-easy-genomics-lab-${s3BucketGivenName}`;
  console.log(`Creating S3 Bucket: ${s3BucketFullName}`);

  // S3 bucket names must between 3 - 63 characters long, and globally unique
  if (s3BucketFullName.length < 3 || s3BucketFullName.length > 63) {
    throw new Error(
      `Laboratory creation error, unable to create Laboratory S3 Bucket due to invalid length of bucket name; s3BucketGivenName: ${s3BucketGivenName} is too long`,
    );
  }

  // Create S3 Bucket for Laboratory
  const createS3BucketResult = await s3Service.createBucket({ Bucket: s3BucketFullName });
  console.log(`S3 Bucket Created: ${JSON.stringify(createS3BucketResult)}`);
}
