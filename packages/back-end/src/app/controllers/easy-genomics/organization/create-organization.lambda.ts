import { ConditionalCheckFailedException, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { CreateOrganizationSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/organization';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
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
      throw new Error('Unauthorized access');
    }
    // Post Request Body
    const request: Organization = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    // Data validation safety check
    if (!CreateOrganizationSchema.safeParse(request).success) throw new Error('Invalid request');

    const response: Organization = await organizationService.add({
      ...request,
      OrganizationId: uuidv4(),
      AwsHealthOmicsEnabled: request.AwsHealthOmicsEnabled || false,
      NextFlowTowerEnabled: request.NextFlowTowerEnabled || false,
      CreatedAt: new Date().toISOString(),
      CreatedBy: userId,
    });
    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildResponse(400, JSON.stringify({ Error: getErrorMessage(err) }), event);
  }
};

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  if (err instanceof ConditionalCheckFailedException) {
    return 'Organization already exists';
  } else if (err instanceof TransactionCanceledException) {
    return 'Organization Name already taken';
  } else {
    return err.message;
  }
}
