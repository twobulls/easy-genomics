import { createHmac } from 'crypto';
import { ConfirmUpdateUserInvitationRequestSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-invitation';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { ConfirmUserInvitationRequest } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-invitation';
import { UserInvitationJwt } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-verification-jwt';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Handler,
} from 'aws-lambda';
import { JwtPayload } from 'jsonwebtoken';
import { CognitoIdpService } from '../../../services/cognito-idp-service';
import { OrganizationUserService } from '../../../services/easy-genomics/organization-user-service';
import { UserService } from '../../../services/easy-genomics/user-service';
import { verifyJwt } from '../../../utils/jwt-utils';

const cognitoIdpService = new CognitoIdpService();
const organizationUserService = new OrganizationUserService();
const userService = new UserService();

export const handler: Handler = async (
  event: APIGatewayProxyEvent,
): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Put Request Body
    const request: ConfirmUserInvitationRequest = (
      event.isBase64Encoded ? JSON.parse(atob(event.body!)) : JSON.parse(event.body!)
    );

    // Data validation safety check
    if (!ConfirmUpdateUserInvitationRequestSchema.safeParse(request).success) throw new Error('Invalid request');

    // Verify JWT has not expired and signature is valid
    const jwtPayload: JwtPayload | string = verifyJwt(request.Token, process.env.JWT_SECRET_KEY);

    if (typeof jwtPayload === 'object') {
      // Check JWT RequestType is the expected 'UserInvitation'
      const payload: UserInvitationJwt = <UserInvitationJwt>jwtPayload;
      if (payload.RequestType !== 'UserInvitation') {
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
        .update(user.UserId + payload.OrganizationId)
        .digest('hex');
      if (payload.Verification !== verification) {
        throw new Error('User Invitation Verification invalid');
      } else {
        // Lookup OrganizationUser access mapping to check invitation has not already been activated / restricted.
        const organizationUser: OrganizationUser = await organizationUserService.get(payload.OrganizationId, user.UserId);
        if (organizationUser.Status === 'Active') {
          throw new Error('User invitation to access Organization is already activated.');
        } else if (organizationUser.Status === 'Inactive') {
          throw new Error('User access to Organization has been deactivated. Please contact the System Administrator for assistance.');
        } else {
          // Update OrganizationUser access mapping Status to 'Active'
          await organizationUserService.update({
            ...organizationUser,
            Status: 'Active',
            ModifiedAt: new Date().toISOString(),
            ModifiedBy: user.UserId,
          });
        }

        // New User invited to the Platform
        if (user.Status === 'Invited') {
          // Update User's Status to 'Active' and set the supplied names
          await Promise.all([
            userService.update({
              ...user,
              FirstName: request.FirstName,
              LastName: request.LastName,
              Status: 'Active',
              ModifiedAt: new Date().toISOString(),
              ModifiedBy: user.UserId,
            }, user),
            // Update Cognito User Email to verified, update password, and enable account
            cognitoIdpService.adminUpdateUserEmailVerified(process.env.COGNITO_USER_POOL_ID, user.UserId, true),
            cognitoIdpService.adminSetUserPassword(process.env.COGNITO_USER_POOL_ID, user.UserId, request.Password),
            cognitoIdpService.adminEnableUser(process.env.COGNITO_USER_POOL_ID, user.UserId),
          ]);
        }

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
