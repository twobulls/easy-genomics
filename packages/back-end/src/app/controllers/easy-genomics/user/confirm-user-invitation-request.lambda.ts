import { createHmac } from 'crypto';
import { buildClient, CommitmentPolicy, KmsKeyringNode } from '@aws-crypto/client-node';
import { InitiateAuthCommandOutput } from '@aws-sdk/client-cognito-identity-provider';
import { ConfirmUpdateUserInvitationRequestSchema } from '@easy-genomics/shared-lib/src/app/schema/easy-genomics/user-invitation';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import {
  LaboratoryAccess,
  LaboratoryAccessDetails,
  OrganizationAccess,
  OrganizationAccessDetails,
  User,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { ConfirmUserInvitationRequest } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-invitation';
import { UserInvitationJwt } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user-verification-jwt';
import { buildResponse } from '@easy-genomics/shared-lib/src/app/utils/common';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Handler } from 'aws-lambda';
import { toByteArray } from 'base64-js';
import { JwtPayload } from 'jsonwebtoken';
import { CognitoIdpService } from '../../../services/cognito-idp-service';
import { OrganizationUserService } from '../../../services/easy-genomics/organization-user-service';
import { PlatformUserService } from '../../../services/easy-genomics/platform-user-service';
import { UserService } from '../../../services/easy-genomics/user-service';
import { verifyJwt } from '../../../utils/jwt-utils';

const cryptoClient = buildClient(CommitmentPolicy.FORBID_ENCRYPT_ALLOW_DECRYPT);
const generatorKeyId = process.env.COGNITO_KMS_KEY_ID;
const keyIds = [process.env.COGNITO_KMS_KEY_ARN];
const keyring = new KmsKeyringNode({ generatorKeyId, keyIds });

const cognitoIdpService = new CognitoIdpService({ userPoolId: process.env.COGNITO_USER_POOL_ID });
const organizationUserService = new OrganizationUserService();
const platformUserService = new PlatformUserService();
const userService = new UserService();

export const handler: Handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('EVENT: \n' + JSON.stringify(event, null, 2));
  try {
    // Post Request Body
    const request: ConfirmUserInvitationRequest = event.isBase64Encoded
      ? JSON.parse(atob(event.body!))
      : JSON.parse(event.body!);

    // Data validation safety check
    if (!ConfirmUpdateUserInvitationRequestSchema.safeParse(request).success) throw new Error('Invalid request');

    // Verify JWT has not expired and signature is valid
    const jwtPayload: JwtPayload | string = verifyJwt(request.Token, process.env.JWT_SECRET_KEY);

    if (typeof jwtPayload !== 'object') {
      throw new Error(`Unexpected response: ${jwtPayload}`);
    }

    // Check JWT RequestType is the expected 'UserInvitationJwt'
    const payload: UserInvitationJwt = <UserInvitationJwt>jwtPayload;
    if (payload.RequestType !== 'NewUserInvitation' && payload.RequestType !== 'ExistingUserInvitation') {
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
    }

    // Lookup OrganizationUser access mapping to check invitation has not already been activated / restricted.
    const organizationUser: OrganizationUser = await organizationUserService.get(payload.OrganizationId, user.UserId);
    if (organizationUser.Status === 'Active') {
      throw new Error('User invitation to access Organization is already activated.');
    } else if (organizationUser.Status === 'Inactive') {
      throw new Error(
        'User access to Organization has been deactivated. Please contact the System Administrator for assistance.',
      );
    }

    if (payload.RequestType === 'ExistingUserInvitation') {
      // Existing User invited to an Organization
      await updatePlatformUserOrganizationAccess(user, organizationUser);
    } else {
      // New User invited to the Platform and an Organization
      if (user.Status === 'Invited') {
        const temporaryPassword: string | undefined = payload.TemporaryPassword;
        if (!temporaryPassword) {
          throw new Error('User invitation temporary password required');
        }

        // Decrypt the temporaryPassword
        const { plaintext, messageHeader } = await cryptoClient.decrypt(keyring, toByteArray(temporaryPassword));

        // Login with temporaryPassword to obtain accessToken and complete auth challenge set new password
        const response: InitiateAuthCommandOutput = await cognitoIdpService.initiateAuth(
          process.env.COGNITO_USER_POOL_CLIENT_ID,
          user.Email,
          plaintext.toString(),
        );
        if (!response.Session) {
          throw new Error('Unable to obtain authentication access token');
        }

        await cognitoIdpService
          .respondToAuthChallenge(
            process.env.COGNITO_USER_POOL_CLIENT_ID,
            response.Session,
            user.Email,
            request.Password,
          )
          .then(async () => {
            await Promise.all([
              // Update Cognito User's email to verified
              cognitoIdpService.adminUpdateUserEmailVerified(user.UserId, true),
              // Update User's Status to 'Active' and set the supplied names
              updatePlatformUserOrganizationAccess(
                {
                  ...user,
                  FirstName: request.FirstName,
                  LastName: request.LastName,
                },
                organizationUser,
              ),
            ]);
          });
      }
    }

    return buildResponse(200, JSON.stringify({ Status: 'Success' }), event);
  } catch (err: any) {
    console.error(err);
    return buildResponse(400, JSON.stringify({ Error: getErrorMessage(err) }), event);
  }
};

/**
 * Helper function to update User's FirstName, LastName, Status,
 * OrganizationAccess metadata Status, and OrganizationUser Status values to
 * 'Active' after completing the sign-up confirmation workflow.
 * @param user
 * @param organizationUser
 */
function updatePlatformUserOrganizationAccess(user: User, organizationUser: OrganizationUser): Promise<Boolean> {
  // Retrieve the User's OrganizationAccess metadata to update
  const organizationAccess: OrganizationAccess | undefined = user.OrganizationAccess;
  const laboratoryAccess: LaboratoryAccess | undefined =
    organizationAccess && organizationAccess[organizationUser.OrganizationId]
      ? organizationAccess[organizationUser.OrganizationId].LaboratoryAccess
      : undefined;

  return platformUserService.editExistingUserAccessToOrganization(
    {
      ...user,
      Status: 'Active',
      OrganizationAccess: {
        ...organizationAccess,
        [organizationUser.OrganizationId]: <OrganizationAccessDetails>{
          Status: 'Active',
          LaboratoryAccess: <LaboratoryAccessDetails>{
            ...(laboratoryAccess ? laboratoryAccess : {}),
          },
        },
      },
      ModifiedAt: new Date().toISOString(),
      ModifiedBy: user.UserId,
    },
    {
      ...organizationUser,
      Status: 'Active',
      ModifiedAt: new Date().toISOString(),
      ModifiedBy: user.UserId,
    },
  );
}

// Used for customising error messages by exception types
function getErrorMessage(err: any) {
  return err.message;
}
