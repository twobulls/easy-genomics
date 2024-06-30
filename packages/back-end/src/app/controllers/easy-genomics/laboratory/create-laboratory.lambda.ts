import * as crypto from 'crypto';
import { ConditionalCheckFailedException, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import {
  CreateLaboratory,
  CreateLaboratorySchema,
} from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { LaboratoryService } from '../../../services/easy-genomics/laboratory-service';
import { OrganizationService } from '../../../services/easy-genomics/organization-service';
import { S3Service } from '../../../services/s3-service';
import { encrypt } from '../../../utils/encryption-utils';

const organizationService = new OrganizationService();
const laboratoryService = new LaboratoryService();
const s3Service = new S3Service();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const currentUserId = event.requestContext.authorizer.claims['cognito:username'];
    // Post Request Body
    const request: CreateLaboratory = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    const parseResult = CreateLaboratorySchema.safeParse(request);
    if (!parseResult.success) {
      console.error('Invalid request:', JSON.stringify(request, null, 2));
      console.error('Invalid request; CreateLaboratorySchema; parseResult:', JSON.stringify(parseResult, null, 2));
      throw new Error('Invalid request');
    }

    const newLab = parseResult.data as CreateLaboratory;

    // Validate OrganizationId exists before creating Laboratory
    const organization: Organization = await organizationService.get(newLab.OrganizationId);
    if (!organization) {
      throw new Error(`Laboratory creation error, OrganizationId '${newLab.OrganizationId}' not found`);
    }

    // START Temporary S3 Bucket Creation Limit Workaround
    // Stop trying to create S3 buckets when creating a new lab until we have a solution to the max S3 buckets limit issue
    // This error can be seen in the logs of the create-laboratory lambda function e.g, In quality,
    // 2024-06-18T03:37:46.136Z	f371f96d-bb72-476f-8d79-763f43e9047a	ERROR	[s3-service : s3Request] accountId: 851725267090, region: us-east-1, command: create-bucket exception encountered: TooManyBuckets: You have attempted to create more buckets than allowed

    /*
    const s3BucketId: string = `${crypto.randomBytes(16).toString('hex')}`;
    const s3Bucket: string = `${process.env.NAME_PREFIX}-easy-genomics-lab-${s3BucketId}`;

    // S3 bucket names must between 3 - 63 characters long, and globally unique
    if (s3Bucket.length < 3 || s3Bucket.length > 63) {
      throw new Error('Laboratory creation error, unable to create Laboratory S3 Bucket due to invalid length');
    }
    // Create S3 Bucket for Laboratory
    await s3Service.createBucket({ Bucket: s3Bucket });
    */

    const s3Bucket: string = 'fake-bucket-name';
    // END Temporary S3 Bucket Creation Limit Workaround

    const response: Laboratory = await laboratoryService.add({
      ...newLab,
      NextFlowTowerAccessToken: await encrypt(newLab.NextFlowTowerAccessToken),
      LaboratoryId: uuidv4(),
      AwsHealthOmicsEnabled: newLab.AwsHealthOmicsEnabled || organization.AwsHealthOmicsEnabled || false,
      NextFlowTowerEnabled: newLab.NextFlowTowerEnabled || organization.NextFlowTowerEnabled || false,
      S3Bucket: s3Bucket,
      CreatedAt: new Date().toISOString(),
      CreatedBy: currentUserId,
    });
    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        Error: getErrorMessage(err),
      }),
    };
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
