import {
  AdminCreateUserCommand,
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
   * This function creates a new Cognito User account for the new User, and
   * returns the Cognito Username.
   *
   * @param email
   */
  async addNewUserToPlatform(email: string): Promise<string> {
    const logRequestMessage = `Add New User Email=${email} to Platform request`;
    console.info(logRequestMessage);

    const adminCreateUserCommand: AdminCreateUserCommand = new AdminCreateUserCommand({
      MessageAction: 'SUPPRESS',
      DesiredDeliveryMediums: ['EMAIL'],
      Username: email,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'email_verified', Value: 'false' },
      ],
      UserPoolId: this.props.userPoolId,
    });
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