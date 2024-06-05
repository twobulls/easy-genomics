import {
  AdminEnableUserCommand,
  AdminEnableUserCommandInput,
  AdminEnableUserCommandOutput,
  AdminGetUserCommand,
  AdminGetUserCommandInput,
  AdminGetUserCommandOutput,
  AdminSetUserPasswordCommand,
  AdminSetUserPasswordCommandInput,
  AdminSetUserPasswordCommandOutput,
  AdminUpdateUserAttributesCommand,
  AdminUpdateUserAttributesCommandInput,
  AdminUpdateUserAttributesCommandOutput,
  CognitoIdentityProviderClient,
  CognitoIdentityProviderServiceException,
  ForgotPasswordCommand,
  ForgotPasswordCommandInput,
  ForgotPasswordCommandOutput,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';

export enum CognitoIdpCommand {
  ADMIN_ENABLE_USER = 'admin-enable-user',
  ADMIN_GET_USER = 'admin-get-user',
  ADMIN_SET_USER_PASSWORD = 'admin-set-user-password',
  ADMIN_UPDATE_USER_ATTRIBUTES = 'admin-update-user-attributes',
  FORGOT_PASSWORD = 'forgot-password',
};

export class CognitoIdpService {
  readonly cognitoIdpClient;

  public constructor() {
    this.cognitoIdpClient = new CognitoIdentityProviderClient();
  }

  /**
   * Enables a Cognito User account for the specified username.
   * @param userPoolId
   * @param username
   */
  public adminEnableUser = async(userPoolId: string, username: string): Promise<AdminEnableUserCommandOutput> => {
    console.log(`[cognito-idp-service : adminEnableUser] userPoolId: ${userPoolId}, username: ${username}`);
    const response: AdminEnableUserCommandOutput =
      await this.cognitoIdpRequest<AdminEnableUserCommandInput, AdminEnableUserCommandOutput>(
        CognitoIdpCommand.ADMIN_ENABLE_USER,
        {
          UserPoolId: userPoolId,
          Username: username,
        },
      );
    if (response.$metadata.httpStatusCode === 200) {
      return response;
    } else {
      throw new Error(`Unable to enable cognito user request: ${JSON.stringify(response)}`);
    }
  };

  /**
   * Looks up a Cognito User account for the specified username.
   * @param userPoolId
   * @param username
   */
  public adminGetUser = async(userPoolId: string, username: string): Promise<AdminGetUserCommandOutput> => {
    console.log(`[cognito-idp-service : adminGetUser] userPoolId: ${userPoolId}, username: ${username}`);
    const response: AdminGetUserCommandOutput =
      await this.cognitoIdpRequest<AdminGetUserCommandInput, AdminGetUserCommandOutput>(
        CognitoIdpCommand.ADMIN_GET_USER,
        {
          UserPoolId: userPoolId,
          Username: username,
        },
      );
    if (response.$metadata.httpStatusCode === 200) {
      return response;
    } else {
      throw new Error(`Unable to verify cognito user request: ${JSON.stringify(response)}`);
    }
  };

  /**
   * Updates a Cognito User account password for the specified username.
   * @param userPoolId
   * @param username
   */
  public adminSetUserPassword = async(userPoolId: string, username: string, password: string): Promise<AdminSetUserPasswordCommandOutput> => {
    console.log(`[cognito-idp-service : adminSetUserPassword] userPoolId: ${userPoolId}, username: ${username}`);
    const response: AdminSetUserPasswordCommandOutput =
      await this.cognitoIdpRequest<AdminSetUserPasswordCommandInput, AdminSetUserPasswordCommandOutput>(
        CognitoIdpCommand.ADMIN_SET_USER_PASSWORD,
        {
          UserPoolId: userPoolId,
          Username: username,
          Password: password,
          Permanent: true,
        },
      );
    if (response.$metadata.httpStatusCode === 200) {
      return response;
    } else {
      throw new Error(`Unable to update cognito user password request: ${JSON.stringify(response)}`);
    }
  };

  /**
   * Updates a Cognito User email and email_verified attributes to support switching the email for the specified username.
   * @param userPoolId
   * @param username
   * @param email
   */
  public adminUpdateUserEmail = async(
    userPoolId: string,
    username: string,
    email: string,
  ): Promise<AdminUpdateUserAttributesCommandOutput> => {
    console.log(`[cognito-idp-service : adminUpdateUserEmail] userPoolId: ${userPoolId}, username: ${username}`);
    const response: AdminUpdateUserAttributesCommandOutput =
      await this.cognitoIdpRequest<AdminUpdateUserAttributesCommandInput, AdminUpdateUserAttributesCommandOutput>(
        CognitoIdpCommand.ADMIN_UPDATE_USER_ATTRIBUTES,
        {
          UserPoolId: userPoolId,
          Username: username,
          UserAttributes: [
            { Name: 'email', Value: email },
            { Name: 'email_verified', Value: 'false' }, // Require email change to re-verify account
          ],
        },
      );
    if (response.$metadata.httpStatusCode === 200) {
      return response;
    } else {
      throw new Error(`Unable to update cognito user email request: ${JSON.stringify(response)}`);
    }
  };

  /**
   * Updates a Cognito User email_verified attribute for the specified username.
   * @param userPoolId
   * @param username
   * @param emailVerified
   */
  public adminUpdateUserEmailVerified = async(
    userPoolId: string,
    username: string,
    emailVerified: boolean,
  ): Promise<AdminUpdateUserAttributesCommandOutput> => {
    console.log(`[cognito-idp-service : adminUpdateUserEmailVerified] userPoolId: ${userPoolId}, username: ${username}`);
    const response: AdminUpdateUserAttributesCommandOutput =
      await this.cognitoIdpRequest<AdminUpdateUserAttributesCommandInput, AdminUpdateUserAttributesCommandOutput>(
        CognitoIdpCommand.ADMIN_UPDATE_USER_ATTRIBUTES,
        {
          UserPoolId: userPoolId,
          Username: username,
          UserAttributes: [
            { Name: 'email_verified', Value: `${emailVerified.toString()}` },
          ],
        },
      );
    if (response.$metadata.httpStatusCode === 200) {
      return response;
    } else {
      throw new Error(`Unable to update cognito user email request: ${JSON.stringify(response)}`);
    }
  };

  /**
   * Initiates a Cognito forgot password workflow request for the specified username.
   * @param clientId
   * @param username
   */
  public forgotPassword = async(clientId: string, username: string): Promise<ForgotPasswordCommandOutput> => {
    console.log(`[cognito-idp-service : forgotPassword] clientId: ${clientId}, username: ${username}`);
    const response: ForgotPasswordCommandOutput =
      await this.cognitoIdpRequest<ForgotPasswordCommandInput, ForgotPasswordCommandOutput>(
        CognitoIdpCommand.FORGOT_PASSWORD,
        {
          ClientId: clientId,
          Username: username,
        },
      );
    if (response.$metadata.httpStatusCode === 200) {
      return response;
    } else {
      throw new Error(`Unable to initiate forgot password request: ${JSON.stringify(response)}`);
    }
  };

  private cognitoIdpRequest = async <RequestType, ResponseType>(command: CognitoIdpCommand, data?: RequestType): Promise<ResponseType> => {
    try {
      console.log(
        `[cognito-idp-service : cognitoIdpRequest] accountId: ${process.env.ACCOUNT_ID}, region: ${process.env.REGION}, command: ${command}`,
      );

      return (await this.cognitoIdpClient.send(this.getCognitoIdpCommand(command, data)));
    } catch (error: any) {
      console.error(
        `[cognitoIdp-service : cognitoIdpRequest] accountId: ${process.env.ACCOUNT_ID}, region: ${process.env.REGION}, command: ${command} exception encountered:`,
        error,
      );
      throw this.handleError(error);
    }
  };

  private handleError = (error: any): CognitoIdentityProviderServiceException => {
    if (error instanceof UserNotFoundException) {
      return error as UserNotFoundException;
    } else {
      return error as CognitoIdentityProviderServiceException; // Base Exception
    }
  };

  /**
   * Helper function returning the appropriate Cognito-IDP commands.
   *
   * @param command
   * @param data
   */
  private getCognitoIdpCommand = (command: CognitoIdpCommand, data: any): any => {
    switch (command) {
      case CognitoIdpCommand.ADMIN_ENABLE_USER:
        return new AdminEnableUserCommand(data as AdminEnableUserCommandInput);
      case CognitoIdpCommand.ADMIN_GET_USER:
        return new AdminGetUserCommand(data as AdminGetUserCommandInput);
      case CognitoIdpCommand.ADMIN_SET_USER_PASSWORD:
        return new AdminSetUserPasswordCommand(data as AdminSetUserPasswordCommandInput);
      case CognitoIdpCommand.ADMIN_UPDATE_USER_ATTRIBUTES:
        return new AdminUpdateUserAttributesCommand(data as AdminUpdateUserAttributesCommandInput);
      case CognitoIdpCommand.FORGOT_PASSWORD:
        return new ForgotPasswordCommand(data as ForgotPasswordCommandInput);
      default:
        throw new Error(`Unsupported Cognito IDP Command '${command}'`);
    }
  };
}
