import { Bucket, ListBucketsCommandOutput } from '@aws-sdk/client-s3';
import { S3Bucket } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/s3-bucket';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { S3Service } from '../../services/s3-service';

const s3Service = new S3Service();

/**
 * This API endpoint is designed to allow customers to obtain list of existing
 * S3 buckets within their AWS account with the intent of allowing the
 * Organization Administrator to select an existing S3 Bucket for use by a
 * Laboratory instead of the auto-provisioned S3 Bucket.
 */
export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const response: ListBucketsCommandOutput = await s3Service.listBuckets({});
    if (response.Buckets) {
      // Exclude CDK, Amplify, and FE Hosting/CloudFront S3 Buckets
      const buckets: S3Bucket[] = response.Buckets.filter(
        (bucket: Bucket) =>
          !bucket.Name?.startsWith('cdk') &&
          !bucket.Name?.startsWith('amplify') &&
          !bucket.Name?.startsWith(process.env.DOMAIN_NAME),
      ).flatMap((bucket: Bucket) => {
        return <S3Bucket>{ Name: bucket.Name };
      });
      return buildResponse(200, JSON.stringify(buckets), event);
    } else {
      throw new Error(`Unable to list Buckets: ${JSON.stringify(response)}`);
    }
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 400,
      body: `Error: ${err.message}`,
    };
  }
};
