import {
  AdminCreateUserCommand,
  AdminCreateUserCommandInput,
  AdminCreateUserCommandOutput,
  AdminDeleteUserCommand,
  AdminDeleteUserCommandOutput,
  CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider';

export interface CognitoUserServiceProps {
  userPoolId: string;
}

export class CognitoUserService {
  private readonly props: CognitoUserServiceProps;
  private readonly cognitoClient: CognitoIdentityProviderClient;

  public constructor(props: CognitoUserServiceProps) {
    this.props = props;
    this.cognitoClient = new CognitoIdentityProviderClient();
  }

  /**
   * This function invites new User to the Platform by creating a new Cognito
   * User account / resending invite, and returns the Cognito Username.
   * @param email
   * @param organizationId
   * @param organizationName
   * @param resend
   */
  async inviteNewUserToPlatform(email: string, organizationId: string, organizationName: string, resend?: boolean): Promise<string> {
    const logRequestMessage = `Add New User Email=${email} to Platform request`;
    console.info(logRequestMessage);

    const adminCreateUserCommandInput: AdminCreateUserCommandInput = {
      ...(resend === true ?? { MessageAction: 'RESEND' }),
      DesiredDeliveryMediums: ['EMAIL'],
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'false' },
      ],
      UserPoolId: this.props.userPoolId,
      ClientMetadata: {
        ['OrganizationId']: organizationId,
        ['OrganizationName']: organizationName,
      },
    };

    const adminCreateUserCommand: AdminCreateUserCommand = new AdminCreateUserCommand(adminCreateUserCommandInput);
    const response: AdminCreateUserCommandOutput = await this.cognitoClient.send<AdminCreateUserCommand>(adminCreateUserCommand);

    if (response.$metadata.httpStatusCode === 200 && response.User && response.User.Username) {
      return response.User.Username;
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  }

  /**
   * This function deletes an existing Cognito User account, and is intended for
   * use as part of the User off-boarding / clean up process.
   * @param email
   */
  async deleteUserFromPlatform(email: string): Promise<boolean> {
    const logRequestMessage = `Delete User Email=${email} to Platform request`;
    console.info(logRequestMessage);

    const adminDeleteUserCommand: AdminDeleteUserCommand = new AdminDeleteUserCommand({
      Username: email,
      UserPoolId: this.props.userPoolId,
    });
    const response: AdminDeleteUserCommandOutput = await this.cognitoClient.send<AdminDeleteUserCommand>(adminDeleteUserCommand);

    if (response.$metadata.httpStatusCode === 200) {
      return true;
    } else {
      throw new Error(`${logRequestMessage} unsuccessful: HTTP Status Code=${response.$metadata.httpStatusCode}`);
    }
  }
}