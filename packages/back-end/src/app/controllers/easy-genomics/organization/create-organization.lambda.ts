import { ConditionalCheckFailedException, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { CreateOrganizationSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/organization';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  InvalidRequestError,
  OrganizationAlreadyExistsError,
  OrganizationNameTakenError,
  UnauthorizedAccessError,
} from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { OrganizationService } from '@BE/services/easy-genomics/organization-service';
import { validateSystemAdminAccess } from '@BE/utils/auth-utils';

const organizationService = new OrganizationService();

/**
 * This API is restricted to only the System Admin User who will oversee the
 * creation of one or more Organizations in the Easy Genomics platform.
 *
 * @param event
 */
export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const userId = event.requestContext.authorizer.claims['cognito:username'];
    if (!validateSystemAdminAccess(event)) {
      throw new UnauthorizedAccessError();
    }
    // Post Request Body
    const request: Organization = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    if (!CreateOrganizationSchema.safeParse(request).success) throw new InvalidRequestError();

    const response: Organization | void = await organizationService
      .add({
        ...request,
        OrganizationId: uuidv4(),
        AwsHealthOmicsEnabled: request.AwsHealthOmicsEnabled || false,
        NextFlowTowerEnabled: request.NextFlowTowerEnabled || false,
        NextFlowTowerApiBaseUrl: request.NextFlowTowerApiBaseUrl || process.env.SEQERA_API_BASE_URL,
        CreatedAt: new Date().toISOString(),
        CreatedBy: userId,
      })
      .catch((error: any) => {
        if (error instanceof ConditionalCheckFailedException) {
          throw new OrganizationAlreadyExistsError();
        } else if (error instanceof TransactionCanceledException) {
          throw new OrganizationNameTakenError();
        } else {
          throw error;
        }
      });
    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
