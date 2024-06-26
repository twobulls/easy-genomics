import { TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { GetBucketLocationCommandOutput } from '@aws-sdk/client-s3';
import {
  UpdateLaboratory,
  UpdateLaboratorySchema,
} from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '../../../services/easy-genomics/laboratory-service';
import { S3Service } from '../../../services/s3-service';
import { encrypt } from '../../../utils/encryption-utils';

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
    const request: UpdateLaboratory = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    const parseResult = UpdateLaboratorySchema.safeParse(request);
    if (!parseResult.success) {
      console.error('Invalid request:', JSON.stringify(request, null, 2));
      console.error('Invalid request; UpdateLaboratorySchema; parseResult:', JSON.stringify(parseResult, null, 2));
      throw new Error('Invalid request');
    }

    const updatedLab = parseResult.data as UpdateLaboratory;

    // TODO: requires handling of S3 buckets in Easy Genomics to be resolved. Commenting out S3 code for now.
    // Check Laboratory S3 Bucket is valid
    // if (!request.S3Bucket) {
    //   throw new Error('Laboratory S3 Bucket is required');
    // }
    // const bucketLocation: GetBucketLocationCommandOutput = await s3Service.getBucketLocation({
    //   Bucket: request.S3Bucket,
    // });
    // if (bucketLocation.$metadata.httpStatusCode !== 200) {
    //   throw new Error(`Unable to find Laboratory S3 Bucket: ${request.S3Bucket}`);
    // }
    /**
     * S3 CLI/SDK get-bucket-location lookup will return LocationConstraint = null for the AWS region 'us-east-1'.
     * This is the expected behaviour: https://github.com/aws/aws-cli/issues/3864
     */
    // if (
    //   (process.env.REGION === 'us-east-1' && bucketLocation.LocationConstraint != null) ||
    //   (process.env.REGION !== 'us-east-1' && process.env.REGION !== bucketLocation.LocationConstraint)
    // ) {
    //   throw new Error(`Laboratory S3 Bucket does not belong to the same AWS Region: ${process.env.AWS_REGION}`);
    // }

    // Lookup by LaboratoryId to confirm existence before updating
    const existing: Laboratory = await laboratoryService.queryByLaboratoryId(id);

    let NextFlowTowerAccessToken = existing.NextFlowTowerAccessToken; // Can be undefined | encrypted string
    if (NextFlowTowerAccessToken !== updatedLab.NextFlowTowerAccessToken) {
      // NextFlowTowerAccessToken was edited, so encrypt the value from the request and store it in the database
      NextFlowTowerAccessToken = await encrypt(updatedLab.NextFlowTowerAccessToken);
    }

    const lab: Laboratory = await laboratoryService.update(
      {
        ...existing,
        ...updatedLab,
        NextFlowTowerAccessToken,
        ModifiedAt: new Date().toISOString(),
        ModifiedBy: userId,
      },
      existing,
    );
    return buildResponse(200, JSON.stringify(lab), event);
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
}
