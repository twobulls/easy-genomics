import {
  AdminGetUserCommand,
  AdminGetUserCommandInput,
  AdminGetUserCommandOutput,
  CognitoIdentityProviderClient,
  CognitoIdentityProviderServiceException,
  ForgotPasswordCommand,
  ForgotPasswordCommandInput,
  ForgotPasswordCommandOutput,
  UserNotFoundException,
} from '@aws-sdk/client-cognito-identity-provider';
import { AdminGetUserResponse } from '@aws-sdk/client-cognito-identity-provider/dist-types/models/models_0';

export enum CognitoIdpCommand {
  ADMIN_GET_USER = 'admin-get-user',
  FORGOT_PASSWORD = 'forgot-password',
};

export class CognitoIdpService {
  readonly cognitoIdpClient;

  public constructor() {
    this.cognitoIdpClient = new CognitoIdentityProviderClient();
  }

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
        `[cognito-idp-service : cognitoIdpRequest] accountId: ${process.env.AWS_ACCOUNT_ID}, region: ${process.env.AWS_REGION}, command: ${command}`,
      );

      return (await this.cognitoIdpClient.send(this.getCognitoIdpCommand(command, data)));
    } catch (error: any) {
      console.error(
        `[cognitoIdp-service : cognitoIdpRequest] accountId: ${process.env.AWS_ACCOUNT_ID}, region: ${process.env.AWS_REGION}, command: ${command} exception encountered:`,
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
      case CognitoIdpCommand.ADMIN_GET_USER:
        return new AdminGetUserCommand(data as AdminGetUserCommandInput);
      case CognitoIdpCommand.FORGOT_PASSWORD:
        return new ForgotPasswordCommand(data as ForgotPasswordCommandInput);
      default:
        throw new Error(`Unsupported Cognito IDP Command '${command}'`);
    }
  };
}
