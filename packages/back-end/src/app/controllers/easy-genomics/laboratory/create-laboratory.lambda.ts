import * as crypto from 'crypto';
import { ConditionalCheckFailedException, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { CreateLaboratorySchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory';
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
    const request: Laboratory = (
      event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!)
    );
    // Data validation safety check
    if (!CreateLaboratorySchema.safeParse(request).success) throw new Error('Invalid request');

    // Validate OrganizationId exists before creating Laboratory
    const organization: Organization = await organizationService.get(request.OrganizationId);
    if (!organization) {
      throw new Error(`Laboratory creation error, OrganizationId '${request.OrganizationId}' not found`);
    }

    const s3BucketId: string = `${crypto.randomBytes(16).toString('hex')}`;
    const s3Bucket: string = `${process.env.NAME_PREFIX}-easy-genomics-lab-${s3BucketId}`;

    // S3 bucket names must between 3 - 63 characters long, and globally unique
    if (s3Bucket.length < 3 || s3Bucket.length > 63) {
      throw new Error('Laboratory creation error, unable to create Laboratory S3 Bucket due to invalid length');
    }
    // Create S3 Bucket for Laboratory
    await s3Service.createBucket({ Bucket: s3Bucket });

    const response: Laboratory = await laboratoryService.add({
      ...request,
      NextFlowTowerAccessToken: await encrypt(request.NextFlowTowerAccessToken),
      LaboratoryId: uuidv4(),
      AwsHealthOmicsEnabled: request.AwsHealthOmicsEnabled || organization.AwsHealthOmicsEnabled || false,
      NextFlowTowerEnabled: request.NextFlowTowerEnabled || organization.NextFlowTowerEnabled || false,
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
};
