import path from 'path';
import * as stream from 'stream';
//import { Readable } from 'stream';
import { GetObjectCommandOutput, ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';
import { createS3Zip } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/file/create-s3-zip';
import {
  SnsProcessingEvent,
  SnsProcessingOperation,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/sns-processing-event';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import archiver, { ArchiverError } from 'archiver';
import { APIGatewayProxyResult, Handler, SQSRecord } from 'aws-lambda';
import { SQSEvent } from 'aws-lambda/trigger/sqs';
import { S3Service } from '@BE/services/s3-service';

const s3Service = new S3Service();

type S3ObjectStream = {
  key: string;
  output: GetObjectCommandOutput;
};

export const handler: Handler = async (event: SQSEvent): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const sqsRecords: SQSRecord[] = event.Records;
    for (const sqsRecord of sqsRecords) {
      const body = JSON.parse(sqsRecord.body);
      const snsEvent: SnsProcessingEvent = <SnsProcessingEvent>JSON.parse(body.Message);

      switch (snsEvent.Type) {
        case 'S3Zip':
          const createS3ZipRequest: createS3Zip = <createS3Zip>JSON.parse(JSON.stringify(snsEvent.Record));
          await processCreateZipEvent(snsEvent.Operation, createS3ZipRequest);
          break;
        default:
          console.error(`Unsupported SNS Processing Event Type: ${snsEvent.Type}`);
      }
    }

    return buildResponse(200, JSON.stringify({ Status: 'Success' }));
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err);
  }
};

async function processCreateZipEvent(operation: SnsProcessingOperation, request: createS3Zip) {
  if (operation === 'CREATE') {
    console.log('Processing Create S3 Zip: ', request);
    const s3Prefix: string = request.S3Prefix;

    if (!request.S3Bucket) {
      throw new Error('Missing S3 bucket');
    }

    const bucketObjects: ListObjectsV2CommandOutput = await s3Service.listBucketObjectsV2({
      Bucket: request.S3Bucket,
      Prefix: s3Prefix,
      MaxKeys: request.MaxKeys,
    });

    // convert list to get file commands
    let s3ObjectSteams: S3ObjectStream[] = [];

    if (bucketObjects.Contents) {
      for (let index = 0; index < bucketObjects.Contents.length; index++) {
        const file = bucketObjects.Contents[index];
        if (file.Key) {
          const getObjectCommandOutput = await s3Service.getObject({
            Bucket: request.S3Bucket,
            Key: file.Key,
          });
          s3ObjectSteams.push({
            key: file.Key,
            output: getObjectCommandOutput,
          });
        }
      }
    }

    if (s3ObjectSteams.length > 0) {
      const uploadDir = path.parse(s3Prefix).dir;
      const zipKey = `${uploadDir}/results-${Date.now()}.zip`; // this date postfix is just to make it easier for testing
      await generateZipArchive(request.S3Bucket, zipKey, s3ObjectSteams);
    }
  } else {
    console.error(`Unsupported SNS Processing Event Operation: ${operation}`);
  }
}

/**
 * This function generates a zip archive for a selection of files
 * Definition file and uploads the zip archive to the runs S3 Bucket.
 *
 * @param workFlowFileStream
 */
async function generateZipArchive(s3bucket: string, outputFileKey: string, s3ObjectStreams: S3ObjectStream[]) {
  // If the memory limit for the buffer is too low then it fails
  const highWaterMark = s3ObjectStreams.reduce(
    (n, { output }) => n + (output.ContentLength || 0) + 10 * 1024 * 1024,
    0,
  );
  console.log('Estimated memory', highWaterMark);
  const archive = archiver('zip', {
    zlib: { level: 4 },
    highWaterMark,
  });

  archive.on('end', () => {
    console.log('Zip Archive stream data has been drained: ' + archive.pointer() + ' total bytes');
  });
  archive.on('error', (error: ArchiverError) => {
    console.error('Zip Archive stream encountered an error:', error);
    new Error(`${error.name} ${error.code} ${error.message} ${error.path}  ${error.stack}`);
  });

  const bucket = s3bucket;
  console.log(`Proceeding with generating Zip Archive: Bucket:${bucket}, Key:${outputFileKey}`);
  const streamPassThrough = new stream.PassThrough();

  await new Promise(async (resolve, reject) => {
    streamPassThrough.on('end', resolve);
    //streamPassThrough.on('close', resolve);
    //streamPassThrough.on('error', reject);
    streamPassThrough.on('close', () => {
      console.log('trying to close the stream');
      return resolve;
    });
    streamPassThrough.on('error', (err) => {
      console.log('error on the stream', err.message);
      return reject;
    });

    let totalFileSize = 0;

    for (let index = 0; index < s3ObjectStreams.length; index++) {
      const s3ObjectStream = s3ObjectStreams[index];
      const objectKey = s3ObjectStream.key;
      console.log(`Adding file to zip - Key: ${objectKey}`);
      const filename = path.parse(objectKey).name + path.parse(objectKey).ext;
      const getObjectCommandOutput: GetObjectCommandOutput = s3ObjectStream.output;
      console.log(`Got the GetObjectCommand for: ${filename}`);

      if (getObjectCommandOutput.ContentLength) {
        totalFileSize += getObjectCommandOutput.ContentLength;
      }
      console.log(`file size so far: ${totalFileSize}`);
      if (getObjectCommandOutput.Body) {
        let tempContents = await getObjectCommandOutput.Body.transformToString();

        await archive
          .append(tempContents, {
            name: filename,
          })
          .pipe(streamPassThrough);
      }
      console.log(`Finished appending: ${filename}`);
    }

    console.log(`Finalizing generated Zip Archive: Bucket:${bucket}, Key:${outputFileKey}`);

    await archive.finalize().catch((error) => {
      console.error('Finalize did not want to work: ', error);
    });

    console.log('Finished Finalizing');

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

    console.log('Upload complete');

    // Ensure this promise is resolved to prevent unit tests from timing out
    await streamPassThrough.emit('close');
  }).catch((error) => {
    console.log('We getting errors?');
    console.error('Error encountered: ', error);
    throw new Error(`${error.code} ${error.message} ${error.data}`);
  });
}
