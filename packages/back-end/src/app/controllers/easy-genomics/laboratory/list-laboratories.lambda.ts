import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  NoLabratoriesFoundError,
  RequiredIdNotFoundError,
  UnauthorizedAccessError,
} from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '@BE/services/easy-genomics/laboratory-service';
import {
  getLaboratoryAccessLaboratoryIds,
  validateOrganizationAccess,
  validateOrganizationAdminAccess,
  validateSystemAdminAccess,
} from '@BE/utils/auth-utils';

const laboratoryService = new LaboratoryService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Get Query Parameter
    const organizationId: string | undefined = event.queryStringParameters?.organizationId;
    if (!organizationId) throw new RequiredIdNotFoundError();

    if (!(validateSystemAdminAccess(event) || validateOrganizationAccess(event, organizationId))) {
      throw new UnauthorizedAccessError();
    }

    var response: Laboratory[] = await laboratoryService.queryByOrganizationId(organizationId);

    if (validateSystemAdminAccess(event) || validateOrganizationAdminAccess(event, organizationId)) {
      // System Admins and Organization admins see all laboratories for their organization
    } else {
      const laboratoryIds = getLaboratoryAccessLaboratoryIds(event, organizationId);
      response = response.filter((lab: Laboratory) => laboratoryIds.includes(lab.LaboratoryId));
    }

    if (response) {
      return buildResponse(200, JSON.stringify(response), event);
    } else {
      throw new NoLabratoriesFoundError();
    }
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
