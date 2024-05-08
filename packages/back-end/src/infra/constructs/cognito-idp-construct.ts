import { CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { AccountRecovery, CfnUserPoolGroup, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Construct } from 'constructs';

export interface CognitoIDPConstructProps {
  constructNamespace: string;
  devEnv?: boolean;
}

export class CognitoIdpConstruct extends Construct {
  readonly userPool: UserPool;
  readonly userPoolClient: UserPoolClient;
  readonly userPoolGroup: CfnUserPoolGroup;

  constructor(scope: Construct, id: string, props: CognitoIDPConstructProps) {
    super(scope, id);
    const removalPolicy = props.devEnv ? RemovalPolicy.DESTROY : undefined; // Only for Local, Sandbox, Dev

    // The auth construct defines Cognito Resources for user authentication.
    this.userPool = new UserPool(this, 'user-pool', {
      userPoolName: `${props.constructNamespace}-user-pool`,
      selfSignUpEnabled: false,
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      signInCaseSensitive: false,
      signInAliases: {
        email: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: true,
        requireSymbols: true,
      },
      removalPolicy: removalPolicy,
    });
    new CfnOutput(this, 'UserPoolId', { key: 'UserPoolId', value: this.userPool.userPoolId });

    this.userPoolClient = this.userPool.addClient('client', {
      userPoolClientName: `${props.constructNamespace}-user-pool-client`,
      preventUserExistenceErrors: true,
      authFlows: {
        userSrp: true,
        // TODO: `userPassword` is enabled for testing purposes only; remove this in future after
        //       enabling alternative login for testing
        userPassword: true,
      },
    });
    new CfnOutput(this, 'UserPoolClientId', { key: 'UserPoolClientId', value: this.userPoolClient.userPoolClientId });

    this.userPoolGroup = new CfnUserPoolGroup(this, 'system-admin-user-pool-group', {
      userPoolId: this.userPool.userPoolId,
      // the properties below are optional
      description: 'SystemAdmin Group',
      groupName: 'SystemAdmin',
      precedence: 0,
    });
  }

}
