import { createHmac } from 'crypto';
import { AdminGetUserCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { ConfirmUserForgotPasswordRequestSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-password';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { ConfirmUserForgotPasswordRequest } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-password';
import { UserForgotPasswordJwt } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-verification-jwt';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import { JwtPayload } from 'jsonwebtoken';
import { CognitoIdpService } from '../../../services/cognito-idp-service';
import { UserService } from '../../../services/easy-genomics/user-service';
import { verifyJwt } from '../../../utils/jwt-utils';

const cognitoIdpService = new CognitoIdpService();
const userService = new UserService();

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Put Request Body
    const request: ConfirmUserForgotPasswordRequest = (
      event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!)
    );

    // Data validation safety check
    if (!ConfirmUserForgotPasswordRequestSchema.safeParse(request).success) throw new Error('Invalid request');

    // Verify JWT has not expired and signature is valid
    const jwtPayload: JwtPayload | string = verifyJwt(request.Token, process.env.JWT_SECRET_KEY);

    if (typeof jwtPayload === 'object') {
      // Check JWT RequestType is the expected 'UserForgotPasswordJwt'
      const payload: UserForgotPasswordJwt = <UserForgotPasswordJwt>jwtPayload;
      if (payload.RequestType !== 'UserForgotPassword') {
        throw new Error(`Invalid JWT RequestType: '${payload.RequestType}'`);
      }

      // Lookup User by Email to verify request
      const user: User | undefined = (await userService.queryByEmail(payload.Email)).shift();
      if (!user) {
        throw new Error(`Unable to find User record: '${payload.Email}'`);
      }
      if (user.Status === 'Inactive') {
        throw new Error('User has been deactivated. Please contact the System Administrator for assistance.');
      }

      const verification = createHmac('sha256', process.env.JWT_SECRET_KEY + payload.CreatedAt)
        .update(user.UserId + payload.Code)
        .digest('hex');
      if (payload.Verification !== verification) {
        throw new Error('User Forgot Password Verification invalid');
      } else {
        const response: AdminGetUserCommandOutput = await cognitoIdpService.adminGetUser(process.env.COGNITO_USER_POOL_ID, user.UserId);
        if (response.$metadata.httpStatusCode !== 200) {
          throw new Error(`Unable to find User record: '${payload.Email}'`);
        }
        if (!response.Enabled) {
          throw new Error('User has been deactivated. Please contact the System Administrator for assistance.');
        }

        // Update User's Password
        await cognitoIdpService.adminSetUserPassword(process.env.COGNITO_USER_POOL_ID, user.UserId, request.Password);
        return buildResponse(200, JSON.stringify({ Status: 'Success' }), event);
      }
    } else {
      throw new Error(`Unexpected response: ${jwtPayload}`);
    }
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
