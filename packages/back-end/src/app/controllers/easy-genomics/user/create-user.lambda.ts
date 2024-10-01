import { ConditionalCheckFailedException, TransactionCanceledException } from '@aws-sdk/client-dynamodb';
import { CreateUserSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { buildErrorResponse, buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  InvalidRequestError,
  UserAlreadyExistsError,
  UserNameTakenError,
} from '@easy-genomics/shared-lib/src/app/utils/HttpError';
import { APIGatewayProxyResult, APIGatewayProxyWithCognitoAuthorizerEvent, Handler } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '@BE/services/easy-genomics/user-service';

const userService = new UserService();

// TODO: Deprecate this unused API
export const handler: Handler = async (
  event: APIGatewayProxyWithCognitoAuthorizerEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    const userId = event.requestContext.authorizer.claims['cognito:username'];
    // Post Request Body
    const request: User = event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!);
    console.log('DEBUG: request = ', request);

    // Data validation safety check
    if (!CreateUserSchema.safeParse(request).success) throw new InvalidRequestError();

    // Create new User record in Easy-Genomics User table
    const response: User = await userService
      .add({
        ...request,
        UserId: uuidv4(),
        Status: 'Invited',
        CreatedAt: new Date().toISOString(),
        CreatedBy: userId,
      })
      .catch((error: any) => {
        if (error instanceof ConditionalCheckFailedException) {
          throw new UserAlreadyExistsError();
        } else if (error instanceof TransactionCanceledException) {
          throw new UserNameTakenError();
        } else {
          throw error;
        }
      });

    // TODO: Create Cognito User account for user and send invitation email

    return buildResponse(200, JSON.stringify(response), event);
  } catch (err: any) {
    console.error(err);
    return buildErrorResponse(err, event);
  }
};
