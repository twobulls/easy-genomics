import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import { laboratory, laboratoryUser, organization, organizationUser, uniqueReferences, user } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/sample-data';
import { UniqueReference } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/unique-reference';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { AwsCustomResource, AwsCustomResourcePolicy, PhysicalResourceId } from 'aws-cdk-lib/custom-resources';
import { DynamoDB } from 'aws-sdk';
import { Construct } from 'constructs';
import { DataProvisioningNestedStackProps } from '../types/back-end-stack';

export class DataProvisioningNestedStack extends NestedStack {
  readonly props: DataProvisioningNestedStackProps;

  constructor(scope: Construct, id: string, props: DataProvisioningNestedStackProps) {
    super(scope, id, props);
    this.props = props;

    if (this.props.devEnv) {
      // Add test user to Cognito User Pool
      this.addCognitoTestUser(user);

      // Add seed data to DynamoDB Tables
      this.addDynamoDBSeedData<Organization>(`${this.props.namePrefix}-organization-table`, organization);
      this.addDynamoDBSeedData<Laboratory>(`${this.props.namePrefix}-laboratory-table`, laboratory);
      this.addDynamoDBSeedData<User>(`${this.props.namePrefix}-user-table`, user);

      // Add User mapping data to DynamoDB Tables
      this.addDynamoDBSeedData<OrganizationUser>(`${this.props.namePrefix}-organization-user-table`, organizationUser);
      this.addDynamoDBSeedData<LaboratoryUser>(`${this.props.namePrefix}-laboratory-user-table`, laboratoryUser);

      // Bulk add unique references to UniqueReferences DynamoDB Table
      this.bulkAddDynamoDBSeedData<UniqueReference>(`${this.props.namePrefix}-unique-reference-table`, uniqueReferences);
    }
  }

  private addCognitoTestUser = (testUser: User) => {
    const username = testUser.Email.trim().toLowerCase();
    const password = 'P@ssw0rd';

    const adminCreateUser = new AwsCustomResource(this, 'Easy-Genomics-Test-Admin-User', {
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
        physicalResourceId: PhysicalResourceId.of('Easy-Genomics-Cognito-Create-Test-User'),
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
      removalPolicy: RemovalPolicy.DESTROY,
      installLatestAwsSdk: false,
    });

    // Force the password for the user, because by default when new users are created
    // they are in FORCE_PASSWORD_CHANGE status. The newly created user has no way to change it though.
    const adminSetUserPassword = new AwsCustomResource(this, 'AwsCustomResource-ForcePassword', {
      onCreate: {
        service: 'CognitoIdentityServiceProvider',
        action: 'adminSetUserPassword',
        parameters: {
          UserPoolId: this.props.userPool.userPoolId,
          Username: username,
          Password: password,
          Permanent: true,
        },
        physicalResourceId: PhysicalResourceId.of('Easy-Genomics-Cognito-Update-Test-User-Password'),
      },
      policy: AwsCustomResourcePolicy.fromSdkCalls({ resources: AwsCustomResourcePolicy.ANY_RESOURCE }),
      removalPolicy: RemovalPolicy.DESTROY,
      installLatestAwsSdk: false,
    });
    adminSetUserPassword.node.addDependency(adminCreateUser);
  };

  private addDynamoDBSeedData<T>(tableName: string, testRecord: T) {
    const table: Table | undefined = this.props.dynamoDBTables.get(tableName);

    if (table) {
      new AwsCustomResource(this, `${tableName}_InitData`, {
        onCreate: {
          service: 'DynamoDB',
          action: 'putItem',
          parameters: {
            TableName: tableName,
            Item: DynamoDB.Converter.input(testRecord).M,
          },
          physicalResourceId: {
            id: `${tableName}_InitData`,
          },
        },
        installLatestAwsSdk: false,
        policy: AwsCustomResourcePolicy.fromSdkCalls({
          resources: [table.tableArn],
        }),
        removalPolicy: RemovalPolicy.DESTROY,
      });
    }
  }

  private bulkAddDynamoDBSeedData<T>(tableName: string, testRecords: T[]) {
    const table: Table | undefined = this.props.dynamoDBTables.get(tableName);

    if (table) {
      const batchItems = testRecords.map(testRecord => {
        return { PutRequest: { Item: DynamoDB.Converter.input(testRecord).M } };
      });

      new AwsCustomResource(this, `${tableName}_InitData`, {
        onCreate: {
          service: 'DynamoDB',
          action: 'batchWriteItem',
          parameters: {
            RequestItems: {
              [tableName]: batchItems,
            },
          },
          physicalResourceId: {
            id: `${tableName}_InitData`,
          },
        },
        installLatestAwsSdk: false,
        policy: AwsCustomResourcePolicy.fromSdkCalls({
          resources: [table.tableArn],
        }),
        removalPolicy: RemovalPolicy.DESTROY,
      });
    }
  }
}
