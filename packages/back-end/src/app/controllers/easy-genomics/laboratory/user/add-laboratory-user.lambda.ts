import { ConditionalCheckFailedException } from '@aws-sdk/client-dynamodb';
import { AddLaboratoryUserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/laboratory-user';
import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { LaboratoryService } from '../../../../services/easy-genomics/laboratory-service';
import { LaboratoryUserService } from '../../../../services/easy-genomics/laboratory-user-service';
import { UserService } from '../../../../services/easy-genomics/user-service';

const laboratoryUserService = new LaboratoryUserService();
const laboratoryService = new LaboratoryService();
const userService = new UserService();

export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const userId = event.requestContext.authorizer.claims['cognito:username'];
    // Post Request Body
    const request: LaboratoryUser = (
      event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!)
    );
    // Data validation safety check
    if (!AddLaboratoryUserSchema.safeParse(request).success) throw new Error('Invalid request');

    // Try to retrieve LaboratoryId and UserId to ensure they exist before adding
    await laboratoryService.queryByLaboratoryId(request.LaboratoryId);
    await userService.get(request.UserId);

    const response: LaboratoryUser = await laboratoryUserService.add({
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
    return 'Laboratory User already exists';
  } else {
    return err.message;
  }
};
