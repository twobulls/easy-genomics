import { user } from '@easy-genomics/shared-lib/src/app/types/persistence/sample-data';
import { User } from '@easy-genomics/shared-lib/src/app/types/persistence/user';
import { RemovalPolicy } from 'aws-cdk-lib';
import { AccountRecovery, UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export interface CognitoIDPConstructProps {
  constructNamespace: string;
  devEnv?: boolean;
  envName: string;
}

export class CognitoIdpConstruct extends Construct {
  readonly userPool: UserPool;
  readonly userPoolClient: UserPoolClient;

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

    if (props.devEnv) {
      this.setupTestAdminUser(user);
    }
  }

  /**
   * This function provisions a Test Admin User in the Cognito User Pool using AWS Custom Resource provider.
   */
  private setupTestAdminUser = (sampleUser: User) => {
    const name = `${sampleUser.Title} ${sampleUser.FirstName} ${sampleUser.LastName}`.trim();
    const username = sampleUser.Email.trim().toLowerCase();
    const password = 'P@ssw0rd';

    const adminCreateUser = new AwsCustomResource(this, 'Easy-Genomics-Test-Admin-User', {
      onCreate: {
        service: 'CognitoIdentityServiceProvider',
        action: 'adminCreateUser',
        parameters: {
          UserPoolId: this.userPool.userPoolId,
          Username: username,
          MessageAction: 'SUPPRESS',
          TemporaryPassword: password, // Overridden by force password change
          UserAttributes: [
            { Name: 'email', Value: `${username}` },
            { Name: 'email_verified', Value: 'true' },
            { Name: 'name', Value: `${name}` },
          ],
        },
        physicalResourceId: PhysicalResourceId.of(`AwsCustomResource-CreateUser-${username}`),
      },
      onDelete: {
        service: 'CognitoIdentityServiceProvider',
        action: 'adminDeleteUser',
        parameters: {
          UserPoolId: this.userPool.userPoolId,
          Username: username,
        },
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: AwsCustomResourcePolicy.ANY_RESOURCE }),
      installLatestAwsSdk: true,
    });

    // Force the password for the user, because by default when new users are created
    // they are in FORCE_PASSWORD_CHANGE status. The newly created user has no way to change it though.
    const adminSetUserPassword = new AwsCustomResource(this, 'AwsCustomResource-ForcePassword', {
      onCreate: {
        service: 'CognitoIdentityServiceProvider',
        action: 'adminSetUserPassword',
        parameters: {
          UserPoolId: this.userPool.userPoolId,
          Username: username,
          Password: password,
          Permanent: true,
        },
        physicalResourceId: PhysicalResourceId.of(`AwsCustomResource-ForcePassword-${username}`),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: AwsCustomResourcePolicy.ANY_RESOURCE }),
      installLatestAwsSdk: true,
    });
    adminSetUserPassword.node.addDependency(adminCreateUser);
  };
}
