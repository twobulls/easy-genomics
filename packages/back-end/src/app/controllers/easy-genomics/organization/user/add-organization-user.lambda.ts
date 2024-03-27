import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { AddOrganizationUserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/organization-user';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { OrganizationService } from '../../../../services/easy-genomics/organization-service';
import { OrganizationUserService } from '../../../../services/easy-genomics/organization-user-service';
import { UserService } from '../../../../services/easy-genomics/user-service';

const organizationUserService = new OrganizationUserService();
const organizationService = new OrganizationService();
const userService = new UserService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const userId = event.requestContext.authorizer.claims['cognito:username'];
    // Post Request Body
    const request: OrganizationUser = (
      event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!)
    );
    // Data validation safety check
    if (!AddOrganizationUserSchema.safeParse(request).success) throw new Error('Invalid request');

    // Try to retrieve OrganizationId and UserId to ensure they exist before adding
    await organizationService.get(request.OrganizationId);
    await userService.get(request.UserId);

    const response: OrganizationUser = await organizationUserService.add({
      ...request,
      CreatedAt: new Date().toISOString(),
      CreatedBy: userId,
    });
    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return {
      statusCode: 400,
      body: JSON.stringify({
        Error: getErrorMessage(err),
      }),
    };
  }
};

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  if (err instanceof ConditionalCheckFailedException) {
    return 'Organization User already exists';
  } else {
    return err.message;
  }
};
