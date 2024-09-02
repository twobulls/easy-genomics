import { createHash } from 'crypto';
import { PutObjectCommandOutput } from '@aws-sdk/client-s3';
import { SampleSheetRequestSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/upload/s3-file-upload-sample-sheet';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import {
  SampleSheetRequest,
  SampleSheetResponse,
  UploadedFilePairInfo,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/upload/s3-file-upload-sample-sheet';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { S3Service } from '@BE/services/s3-service';

const SAMPLE_SHEET_CSV_HEADER: string[] = ['sample, fastq_1, fastq_2'];

const laboratoryService = new LaboratoryService();
const s3Service = new S3Service();

/**
 * The SampleSheetRequest's supplied UploadedFiles array is intended to allow
 * the user to use the FE stepper to go back and forth to upload additional
 * files or de-select/remove any uploaded files to correct the generated CSV
 * sample-sheet to provided better usability.
 *
 * This will allow the user to easily amend the generated CSV sample-sheet
 * without having to restart the entire Pipeline Run setup if they uploaded
 * incorrect / unnecessary sequence files.
 *
 * @param event
 */
export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Post Request Body
    const request: SampleSheetRequest = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    const requestParseResult = SampleSheetRequestSchema.safeParse(request);
    if (!requestParseResult.success) {
      requestParseResult.error.issues.forEach((issue) => console.error(issue));
      throw new Error('Invalid request');
    }

    const laboratoryId: string = request.LaboratoryId;
    const transactionId: string = request.TransactionId;
    const laboratory: Laboratory = await laboratoryService.queryByLaboratoryId(laboratoryId);

    const s3Bucket: string | undefined = laboratory.S3Bucket;
    if (!s3Bucket) {
      throw new Error(`Laboratory ${laboratoryId} S3 Bucket needs to be configured`);
    }

    const s3Key: string = `uploads/${laboratoryId}/${transactionId}/sample-sheet.csv`;
    const s3Url: string = `s3://${s3Bucket}/${s3Key}`;
    const bucketLocation = (await s3Service.getBucketLocation({ Bucket: s3Bucket })).LocationConstraint;

    // S3 Buckets in Region us-east-1 have a LocationConstraint of null.
    const s3Region: string = bucketLocation ? bucketLocation : 'us-east-1';

    const sampleSheetCsv: string = await generateSampleSheetCsv(request.UploadedFilePairs);
    const sampleSheetCsvChecksum: string = createHash('sha256').update(sampleSheetCsv).digest('hex');

    const result: PutObjectCommandOutput = await s3Service.putObject({
      ACL: 'private',
      Bucket: s3Bucket,
      Key: s3Key,
      Body: sampleSheetCsv,
      ContentType: 'text/csv',
      ContentLength: sampleSheetCsv.length, // Required for S3 upload to work
    });

    if (result.$metadata.httpStatusCode !== 200) {
      throw new Error(
        `Unable to write '${s3Key}' to S3 Bucket '${s3Bucket}': Error ${result.$metadata.httpStatusCode}`,
      );
    } else {
      const response: SampleSheetResponse = {
        TransactionId: transactionId,
        SampleSheetInfo: {
          Name: 'sample-sheet.csv',
          Size: sampleSheetCsv.length,
          Checksum: sampleSheetCsvChecksum,
          Bucket: s3Bucket,
          Key: s3Key,
          Region: s3Region,
          S3Url: s3Url,
        },
        SampleSheetContents: sampleSheetCsv,
      };
      return buildResponse(200, JSON.stringify(response), event);
    }
  } catch (err: any) {
    console.error(err);
    return buildResponse(400, JSON.stringify({ Error: getErrorMessage(err) }), event);
  }
};

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  return err.message;
}

/**
 * Helper function to generate CSV Sample-Sheet from supplied array of
 * UploadedFilePairInfo definitions, which each consisting of R1 and R2 pairs.
 *
 * @param uploadedFilePairs
 */
async function generateSampleSheetCsv(uploadedFilePairs: UploadedFilePairInfo[]): Promise<string> {
  /**
   * Iterate over the supplied list of UploadedFiles to check the R1 & R2 file
   * pairs exist, and generate CSV sample-sheet row record.
   */
  const sampleSheetCsvData: string[] = (
    await Promise.all(
      uploadedFilePairs.map(async (uploadedFilePair: UploadedFilePairInfo, index: number) => {
        const r1 = uploadedFilePair.R1;
        const r2 = uploadedFilePair.R2;

        const validPair: boolean[] = await Promise.all([
          s3Service.doesObjectExist({ Bucket: r1.Bucket, Key: r1.Key }),
          s3Service.doesObjectExist({ Bucket: r2.Bucket, Key: r2.Key }),
        ]);

        if (validPair[0] === false) {
          throw new Error(`Uploaded R1 sample file not found: ${r1.Key}`);
        } else if (validPair[1] === false) {
          throw new Error(`Uploaded R2 sample file not found: ${r2.Key}`);
        } else {
          return `Sample_${index + 1}, ${r1.S3Url}, ${r2.S3Url}`; // CSV Sample-Sheet row with sample index
        }
      }),
    )
  ).map((csvRow: Awaited<string>) => {
    return csvRow;
  });

  const sampleSheetCsv: string = [...SAMPLE_SHEET_CSV_HEADER, ...sampleSheetCsvData].join('\n');
  return sampleSheetCsv;
}
