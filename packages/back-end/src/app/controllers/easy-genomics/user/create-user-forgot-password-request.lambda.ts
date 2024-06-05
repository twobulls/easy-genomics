import { AdminGetUserCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { CreateUserForgotPasswordRequestSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-password';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { CreateUserForgotPasswordRequest } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-password';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import { CognitoIdpService } from '../../../services/cognito-idp-service';
import { UserService } from '../../../services/easy-genomics/user-service';

const cognitoService: CognitoIdpService = new CognitoIdpService();
const userService: UserService = new UserService();

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Post Request Body
    const request: CreateUserForgotPasswordRequest = (
      event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!)
    );
    // Data validation safety check
    if (!CreateUserForgotPasswordRequestSchema.safeParse(request).success) throw new Error('Invalid request');

    // Verify User
    const user: User | undefined = (await userService.queryByEmail(request.Email)).shift();

    if (!user) {
      throw new Error('Bad request');
    }

    if (user.Status === 'Inactive') {
      throw new Error('Bad request');
    }

    // Retrieve Cognito User Account and initiate Cognito's forgot password workflow
    const cognitoUser: AdminGetUserCommandOutput = await cognitoService.adminGetUser(process.env.COGNITO_USER_POOL_ID, request.Email);

    if (!cognitoUser.Enabled) {
      throw new Error('Bad request');
    }

    const response = await cognitoService.forgotPassword(process.env.COGNITO_USER_POOL_CLIENT_ID, request.Email);
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
  return err.message;
};