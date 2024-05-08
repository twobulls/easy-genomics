import { RemovalPolicy } from 'aws-cdk-lib';
import { CfnUserPoolUserToGroupAttachment, IUserPool } from 'aws-cdk-lib/aws-cognito';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';

export interface CognitoUserConstructProps {
  constructNamespace: string;
  devEnv?: boolean;
  userPool: IUserPool;
}

export class CognitoUserConstruct extends Construct {
  readonly props: CognitoUserConstructProps;

  constructor(scope: Construct, id: string, props: CognitoUserConstructProps) {
    super(scope, id);
    this.props = props;
  }

  public addUser(username: string, password: string, groupName?: string) {
    const removalPolicy = this.props.devEnv ? RemovalPolicy.DESTROY : undefined;

    const adminCreateUser = new AwsCustomResource(this, `AwsCustomResource-CreateUser-${username}`, {
      onCreate: {
        service: 'CognitoIdentityServiceProvider',
        action: 'adminCreateUser',
        parameters: {
          UserPoolId: this.props.userPool.userPoolId,
          Username: username,
          MessageAction: 'SUPPRESS',
          TemporaryPassword: password, // Overridden by force password change
          UserAttributes: [
            { Name: 'email', Value: `${username}` },
            { Name: 'email_verified', Value: 'true' },
          ],
        },
        physicalResourceId: PhysicalResourceId.of(`AwsCustomResource-CreateUser-${username}`),
      },
      onDelete: {
        service: 'CognitoIdentityServiceProvider',
        action: 'adminDeleteUser',
        parameters: {
          UserPoolId: this.props.userPool.userPoolId,
          Username: username,
        },
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: AwsCustomResourcePolicy.ANY_RESOURCE }),
      removalPolicy: removalPolicy,
      installLatestAwsSdk: false,
    });

    // Force the password for the user, because by default when new users are created they are
    // in FORCE_PASSWORD_CHANGE status. The newly created user has no way to change it though.
    const adminSetUserPassword = new AwsCustomResource(this, `AwsCustomResource-ForcePassword-${username}`, {
      onCreate: {
        service: 'CognitoIdentityServiceProvider',
        action: 'adminSetUserPassword',
        parameters: {
          UserPoolId: this.props.userPool.userPoolId,
          Username: username,
          Password: password,
          Permanent: true,
        },
        physicalResourceId: PhysicalResourceId.of(`AwsCustomResource-ForcePassword-${username}`),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: AwsCustomResourcePolicy.ANY_RESOURCE }),
      removalPolicy: removalPolicy,
      installLatestAwsSdk: false,
    });
    adminSetUserPassword.node.addDependency(adminCreateUser);

    // If a Group Name is provided, also add the user to this Cognito UserPool Group
    if (groupName) {
      const userToAdminsGroupAttachment = new CfnUserPoolUserToGroupAttachment(this, `AttachAdminToAdminsGroup-${username}`, {
        userPoolId: this.props.userPool.userPoolId,
        groupName: groupName,
        username: username,
      });
      userToAdminsGroupAttachment.node.addDependency(adminCreateUser);
      userToAdminsGroupAttachment.node.addDependency(adminSetUserPassword);
      userToAdminsGroupAttachment.node.addDependency(this.props.userPool);
    }
  }

}
