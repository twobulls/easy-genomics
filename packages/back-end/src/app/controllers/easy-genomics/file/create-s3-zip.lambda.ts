import path from 'path';
import * as stream from 'stream';
import { Readable } from 'stream';
import { GetObjectCommandOutput, ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/lib/app/utils/common';
import { InvalidRequestError, UnauthorizedAccessError } from '@easy-genomics/shared-lib/lib/app/utils/HttpError';
import { createS3ZipSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/file/create-s3-zip';
import { createS3Zip } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/file/create-s3-zip';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import archiver, { ArchiverError } from 'archiver';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { S3Service } from '@BE/services/s3-service';
import {
  validateLaboratoryManagerAccess,
  validateLaboratoryTechnicianAccess,
  validateOrganizationAdminAccess,
} from '@BE/utils/auth-utils';

const laboratoryService = new LaboratoryService();
const s3Service = new S3Service();

type S3ObjectStream = {
  key: string;
  outputPromise: Promise<GetObjectCommandOutput>;
};

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
    let s3ObjectSteams: S3ObjectStream[] = [];

    if (bucketObjects.Contents) {
      bucketObjects.Contents.forEach((file) => {
        if (file.Key) {
          const getObjectCommandOutputPromise = s3Service.getObject({
            Bucket: s3Bucket,
            Key: file.Key,
          });
          s3ObjectSteams.push({
            key: file.Key,
            outputPromise: getObjectCommandOutputPromise,
          });
        }
      });
    }

    // Only create zip if we have files to add
    if (s3ObjectSteams.length > 0) {
      const uploadDir = path.parse(s3Prefix).dir;
      const zipKey = `${uploadDir}/results.zip`;
      await generateZipArchive(s3Bucket, zipKey, s3ObjectSteams);
      return buildResponse(200, JSON.stringify({ result: `created ${zipKey} succsessfuly` }), event);
    }

    return buildResponse(200, JSON.stringify({ result: 'no files to zip' }), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};

/**
 * This function generates a zip archive for a single uploaded Omics Workflow
 * Definition file and uploads the zip archive to the Omics Input S3 Bucket.
 *
 * In the future if multiple files are required to be included in the zip
 * archive then this function will need to be refactored accordingly.
 *
 * @param workFlowFileStream
 */
const generateZipArchive = async (s3bucket: string, outputFileKey: string, s3ObjectStreams: S3ObjectStream[]) => {
  return new Promise(async (resolve, reject) => {
    const archive = archiver('zip');
    archive.on('end', () => {
      console.log('Zip Archive stream data has been drained: ' + archive.pointer() + ' total bytes');
    });
    archive.on('error', (error: ArchiverError) => {
      console.error('Zip Archive stream encountered an error:', error);
      reject(new Error(`${error.name} ${error.code} ${error.message} ${error.path}  ${error.stack}`));
    });

    const bucket = s3bucket;
    console.log(`Proceeding with generating Zip Archive: Bucket:${bucket}, Key:${outputFileKey}`);

    const streamPassThrough = new stream.PassThrough();
    streamPassThrough.on('end', resolve);
    streamPassThrough.on('close', resolve);
    streamPassThrough.on('error', reject);

    let totalFileSize = 0;

    for (let index = 0; index < s3ObjectStreams.length; index++) {
      const s3ObjectStream = s3ObjectStreams[index];
      const objectKey = s3ObjectStream.key;
      console.log(`Adding file to zip - Key: ${objectKey}`);
      const filename = path.parse(objectKey).name + path.parse(objectKey).ext;
      const getObjectCommandOutput: GetObjectCommandOutput = await s3ObjectStream.outputPromise;
      console.log(`Got the GetObjectCommand for: ${filename}`);

      if (getObjectCommandOutput.ContentLength) {
        totalFileSize += getObjectCommandOutput.ContentLength;
      }
      console.log(`file size so far: ${totalFileSize}`);
      await archive.append(Readable.from(getObjectCommandOutput.Body! as AsyncIterable<ReadableStream>), {
        name: filename,
      });
      console.log(`Finished appending: ${filename}`);
    }

    console.log('Pipe the Piper');
    archive.pipe(streamPassThrough);
    console.log(`Finalizing generated Zip Archive: Bucket:${bucket}, Key:${outputFileKey}`);
    await archive.finalize().catch((error) => {
      console.error('Finalize did not want to work: ', error);
    });

    console.log(
      `Uploading generated Zip Archive to S3: Bucket:${bucket}, Key:${outputFileKey}, Size: ${streamPassThrough.readableLength}`,
    );
    await s3Service.putObject({
      ACL: 'private',
      Bucket: bucket,
      Key: outputFileKey,
      Body: streamPassThrough,
      ContentType: 'application/zip',
      ContentLength: streamPassThrough.readableLength, // Required for S3 upload to work
    });

    // Ensure this promise is resolved to prevent unit tests from timing out
    streamPassThrough.emit('close');
  }).catch((error) => {
    console.error('Error encountered: ', error);
    throw new Error(`${error.code} ${error.message} ${error.data}`);
  });
};
