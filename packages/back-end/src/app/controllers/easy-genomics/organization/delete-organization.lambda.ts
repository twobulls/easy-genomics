import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  OrganizationDeleteFailedError,
  RequiredIdNotFoundError,
  UnauthorizedAccessError,
} from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { OrganizationService } from '@BE/services/easy-genomics/organization-service';
import { validateSystemAdminAccess } from '@BE/utils/auth-utils';

const organizationService = new OrganizationService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    if (!validateSystemAdminAccess(event)) {
      throw new UnauthorizedAccessError();
    }
    // Get Path Parameter
    const id: string = event.pathParameters?.id || '';
    if (id === '') throw new RequiredIdNotFoundError();

    // Lookup by OrganizationId to confirm existence before deletion
    const existing: Organization = await organizationService.get(id);
    const isDeleted: boolean = await organizationService.delete(existing);

    if (!isDeleted) {
      throw new OrganizationDeleteFailedError();
    }

    return buildResponse(200, JSON.stringify({ Status: 'Success' }), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
