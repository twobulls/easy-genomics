import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/lib/app/utils/common';
import {
  InvalidRequestError,
  LaboratoryBucketNotFoundError,
  UnauthorizedAccessError,
} from '@easy-genomics/shared-lib/lib/app/utils/HttpError';
import { RequestFileDownloadSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/files/request-file-download';
import {
  FileDownloadResponse,
  RequestFileDownload,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/files/request-file-download';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
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

/**
 * @param event
 */
export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Post Request Body
    const request: RequestFileDownload = event.isBase64Encoded
      ? JSON.parse(atob(event.body!))
      : JSON.parse(event.body!);
    // Data validation safety check
    const requestParseResult = RequestFileDownloadSchema.safeParse(request);
    if (!requestParseResult.success) {
      throw new InvalidRequestError();
    }

    const laboratoryId: string = request.LaboratoryId;
    const laboratory: Laboratory = await laboratoryService.queryByLaboratoryId(laboratoryId);

    // Only Organisation Admins and Laboratory Members are allowed to edit laboratories
    if (
      !validateOrganizationAdminAccess(event, laboratory.OrganizationId) ||
      !validateLaboratoryManagerAccess(event, laboratory.OrganizationId, laboratory.LaboratoryId) ||
      !validateLaboratoryTechnicianAccess(event, laboratory.OrganizationId, laboratory.LaboratoryId)
    ) {
      throw new UnauthorizedAccessError();
    }

    const s3Key: string = request.Path;
    const s3Bucket: string | undefined = laboratory.S3Bucket;
    if (!s3Bucket) {
      throw new LaboratoryBucketNotFoundError(laboratoryId);
    }

    const preSignedS3DownloadUrl: string = await s3Service.getPreSignedDownloadUrl({
      Bucket: s3Bucket,
      Key: s3Key,
    });

    const response: FileDownloadResponse = {
      DownloadUrl: preSignedS3DownloadUrl,
    };

    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
