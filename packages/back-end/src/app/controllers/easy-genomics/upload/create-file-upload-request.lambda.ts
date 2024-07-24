import { createHash } from 'crypto';
import { RequestFileUploadManifestSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/upload/s3-file-upload-manifest';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import {
  RequestFileUploadManifest,
  ResponseFileUploadManifest,
  UploadFileRequest,
  UploadFileResponse,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/upload/s3-file-upload-manifest';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import ShortUniqueId from 'short-unique-id';
import { LaboratoryService } from '../../../services/easy-genomics/laboratory-service';

const EASY_GENOMICS_SINGLE_FILE_TRANSFER_LIMIT: number = 5 * Math.pow(1024, 3); // 5GiB

const laboratoryService = new LaboratoryService();

/**
 * This API expects a LaboratoryId and a list of file details (consisting of the
 * filename and size) that will be uploaded to S3.
 *
 * This API checks each of the file's sizes and generates list of S3 URLs for
 * each of the filenames for the FE. The generated S3 URLs are then used by the
 * FE to request a signed-url to perform the upload.
 *
 * By only requesting the signed-url at the time needed, it will minimise the
 * duration of the signed-url's expiry window to enhance security.
 *
 * @param event
 */
export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const userId = event.requestContext.authorizer.claims['cognito:username'];
    // Short unique random ID to collate the uploaded files
    const transactionId: string = new ShortUniqueId().stamp(32);

    // Post Request Body
    const request: RequestFileUploadManifest = event.isBase64Encoded
      ? JSON.parse(atob(event.body!))
      : JSON.parse(event.body!);
    // Data validation safety check
    if (!RequestFileUploadManifestSchema.safeParse(request).success) throw new Error('Invalid request');

    const laboratoryId: string = request.LaboratoryId;
    const laboratory: Laboratory = await laboratoryService.queryByLaboratoryId(laboratoryId);
    const s3Bucket: string | undefined = laboratory.S3Bucket;
    if (!s3Bucket) {
      throw new Error(`Laboratory ${laboratoryId} S3 Bucket needs to be configured`);
    }

    const files: UploadFileResponse[] = await Promise.all(
      request.Files.map(async (file: UploadFileRequest) => {
        /**
         * If a file size is greater than the EASY_GENOMICS_SINGLE_FILE_TRANSFER_LIMIT then throw an error,
         * otherwise default to generating a single upload S3 URL for the respective file.
         */
        if (file.Size > EASY_GENOMICS_SINGLE_FILE_TRANSFER_LIMIT) {
          throw new Error(`File size is too large: '${file.Name}'`);
        } else {
          /**
           * The S3 Key will consist of: /uploads/{cognito userId}/{transactionId}/{file name}
           */
          const s3Key: string = `uploads/${userId}/${transactionId}/${file.Name}`;
          const s3Url: string = `s3://${s3Bucket}/${s3Key}`;
          const s3UrlChecksum: string = createHash('sha256').update(s3Url).digest('hex');

          return new Promise<UploadFileResponse>((resolve, _reject) => {
            resolve({
              ...file,
              Bucket: s3Bucket,
              Key: s3Key,
              S3Url: s3Url,
              S3UrlChecksum: s3UrlChecksum, // Security check to prevent spoofing
            });
          });
        }
      }),
    );

    const response: ResponseFileUploadManifest = {
      TransactionId: transactionId,
      Files: files,
    };
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
  return err.message;
}
