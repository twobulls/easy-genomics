import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { UpdateLaboratorySchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '../../../services/easy-genomics/laboratory-service';
import { S3Service } from '../../../services/s3-service';

const laboratoryService = new LaboratoryService();
const s3Service = new S3Service();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Path Parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new Error('Required id is missing');

    const userId: string = event.requestContext.authorizer.claims['cognito:username'];
    // Put Request Body
    const request: Laboratory = (
      event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!)
    );
    // Data validation safety check
    if (!UpdateLaboratorySchema.safeParse(request).success) throw new Error('Invalid request');

    // Check Laboratory S3 Bucket is valid
    if (!request.S3Bucket) {
      throw new Error('Laboratory S3 Bucket is required');
    }
    const bucketLocation = await s3Service.getBucketLocation({ Bucket: request.S3Bucket });
    if (bucketLocation.$metadata.httpStatusCode !== 200) {
      throw new Error(`Unable to find Laboratory S3 Bucket: ${request.S3Bucket}`);
    }
    /**
     * S3 CLI/SDK get-bucket-location lookup will return LocationConstraint = null for the AWS region 'us-east-1'.
     * This is the expected behaviour: https://github.com/aws/aws-cli/issues/3864
     */
    if ((!bucketLocation.LocationConstraint && process.env.REGION !== 'us-east-1') || (bucketLocation.LocationConstraint !== process.env.REGION)) {
      throw new Error(`Laboratory S3 Bucket does not belong to the same AWS Region: ${process.env.AWS_REGION}`);
    }

    // Lookup by LaboratoryId to confirm existence before updating
    const existing: Laboratory = await laboratoryService.queryByLaboratoryId(id);
    const updated: Laboratory = await laboratoryService.update({
      ...existing,
      ...request,
      ModifiedAt: new Date().toISOString(),
      ModifiedBy: userId,
    }, existing);
    return buildResponse(200, JSON.stringify(updated), event);
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
  if (err instanceof TransactionCanceledException) {
    return 'Laboratory Name already taken';
  } else {
    return err.message;
  }
};
