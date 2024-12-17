import { GetParameterCommandOutput } from '@aws-sdk/client-ssm';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/lib/app/utils/common';
import {
  InvalidRequestError,
  LaboratoryAccessTokenUnavailableError,
  UnauthorizedAccessError,
} from '@easy-genomics/shared-lib/lib/app/utils/HttpError';
import { RequestFileDownloadSchema } from '@easy-genomics/shared-lib/src/app/schema/nf-tower/file/request-file-download';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { RequestFileDownload } from '@easy-genomics/shared-lib/src/app/types/nf-tower/file/request-file-download';
import {
  LaboratoryNotFoundError,
  MissingNextFlowTowerAccessError,
} from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import { SsmService } from '@BE/services/ssm-service';
import {
  validateLaboratoryManagerAccess,
  validateLaboratoryTechnicianAccess,
  validateOrganizationAdminAccess,
} from '@BE/utils/auth-utils';
import { httpRequest, REST_API_METHOD } from '@BE/utils/rest-api-utils';

const laboratoryService = new LaboratoryService();
const ssmService = new SsmService();

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
    if (!RequestFileDownloadSchema.safeParse(request).success) {
      throw new InvalidRequestError();
    }

    const laboratoryId: string = request.LaboratoryId;
    const laboratory: Laboratory = await laboratoryService.queryByLaboratoryId(laboratoryId);

    if (!laboratory) {
      throw new LaboratoryNotFoundError();
    }

    // Only Organisation Admins and Laboratory Members are allowed to access downloads
    if (
      !(
        validateOrganizationAdminAccess(event, laboratory.OrganizationId) ||
        validateLaboratoryManagerAccess(event, laboratory.OrganizationId, laboratory.LaboratoryId) ||
        validateLaboratoryTechnicianAccess(event, laboratory.OrganizationId, laboratory.LaboratoryId)
      )
    ) {
      throw new UnauthorizedAccessError();
    }

    // Laboratory requires access to NextFlow Tower
    if (!laboratory.NextFlowTowerEnabled) {
      throw new MissingNextFlowTowerAccessError();
    }

    // Retrieve Seqera Cloud / NextFlow Tower AccessToken from SSM
    const getParameterResponse: GetParameterCommandOutput = await ssmService.getParameter({
      Name: `/easy-genomics/organization/${laboratory.OrganizationId}/laboratory/${laboratory.LaboratoryId}/nf-access-token`,
      WithDecryption: true,
    });

    const accessToken: string | undefined = getParameterResponse.Parameter?.Value;
    if (!accessToken) {
      throw new LaboratoryAccessTokenUnavailableError();
    }

    const contentUri: string = request.ContentUri.replace(/^\/*/, ''); // Remove leading forward slashes
    const url: string = `${process.env.SEQERA_API_BASE_URL}/${contentUri}`;

    // Make HTTP GET request to retrieve file download
    const response: ArrayBuffer = await httpRequest<ArrayBuffer>(url, REST_API_METHOD.GET, {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/octet-stream',
      'Content-Transfer-Encoding': 'BASE64',
    });
    return buildResponse(200, JSON.stringify({ Data: Buffer.from(response).toString('base64') }), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
