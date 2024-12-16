import { ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/lib/app/utils/common';
import { InvalidRequestError, UnauthorizedAccessError } from '@easy-genomics/shared-lib/lib/app/utils/HttpError';
import { createS3ZipSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/file/create-s3-zip';
import { createS3Zip } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/file/create-s3-zip';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { SnsProcessingEvent } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/sns-processing-event';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
//import { v4 as uuidv4 } from 'uuid';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { S3Service } from '@BE/services/s3-service';
import { SnsService } from '@BE/services/sns-service';
import {
  validateLaboratoryManagerAccess,
  validateLaboratoryTechnicianAccess,
  validateOrganizationAdminAccess,
} from '@BE/utils/auth-utils';

const laboratoryService = new LaboratoryService();
const snsService = new SnsService();
const s3Service = new S3Service();

/**
 * This API enables the Easy Genomics FE to request the specified S3 Bucket's
 * objects for display in the File Manager UI.
 *
 * @param event
 */
export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Post Request Body
    const request: createS3Zip = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    if (!createS3ZipSchema.safeParse(request).success) {
      throw new InvalidRequestError();
    }

    const laboratoryId: string = request.LaboratoryId;
    const laboratory: Laboratory = await laboratoryService.queryByLaboratoryId(laboratoryId);

    // Only Organisation Admins and Laboratory Members are allowed to access results
    if (
      !(
        validateOrganizationAdminAccess(event, laboratory.OrganizationId) ||
        validateLaboratoryManagerAccess(event, laboratory.OrganizationId, laboratory.LaboratoryId) ||
        validateLaboratoryTechnicianAccess(event, laboratory.OrganizationId, laboratory.LaboratoryId)
      )
    ) {
      throw new UnauthorizedAccessError();
    }

    const s3Bucket: string = request.S3Bucket ? request.S3Bucket : laboratory.S3Bucket || '';

    // Locking down this endpoint for now to just the results folder
    // In future this endpoint can be expaned and this restriction removed
    const prefixRegex =
      /^([0-9a-fA-F-]{36})\/([0-9a-fA-F-]{36})\/([\w-]+)\/([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})\/results\/?$/;

    const prefixParts = prefixRegex.exec(request.S3Prefix);

    if (prefixParts) {
      // Check the org and lab ids
      if (!prefixParts[0] || prefixParts[1].toLowerCase() != laboratory.OrganizationId) {
        throw new InvalidRequestError('invalid s3Prefix, incorrect organizationID: ' + prefixParts[1].toLowerCase());
      }
      if (!prefixParts[1] || prefixParts[2].toLowerCase() != laboratory.LaboratoryId) {
        throw new InvalidRequestError('invalid s3Prefix, incorrect laboratoryId: ' + prefixParts[2].toLowerCase());
      }
    } else {
      throw new InvalidRequestError('invalid s3Prefix');
    }

    const s3Prefix: string = request.S3Prefix;

    const bucketObjects: ListObjectsV2CommandOutput = await s3Service.listBucketObjectsV2({
      Bucket: s3Bucket,
      Prefix: s3Prefix,
      MaxKeys: request.MaxKeys,
    });

    // convert list to get file commands
    let s3ObjectCount: number = 0;

    if (bucketObjects.Contents) {
      for (let index = 0; index < bucketObjects.Contents.length; index++) {
        const file = bucketObjects.Contents[index];
        if (file.Key) {
          s3ObjectCount++;
        }
      }
    }

    // Only create zip if we have files to add
    if (s3ObjectCount > 0) {
      const record: SnsProcessingEvent = {
        Operation: 'CREATE',
        Type: 'S3Zip',
        Record: {
          ...request,
          S3Bucket: s3Bucket,
        },
      };
      await snsService.publish({
        TopicArn: process.env.SNS_ZIP_RESULTS_CREATION_TOPIC,
        Message: JSON.stringify(record),
        MessageGroupId: `create-s3zip-${laboratoryId}`,
        MessageDeduplicationId: `create-s3zip-${laboratoryId}`, // we don't want extra requests
      });
      return buildResponse(200, JSON.stringify({ result: 'queue zip succsessfuly' }), event);
    }

    return buildResponse(200, JSON.stringify({ result: 'no files to zip' }), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
