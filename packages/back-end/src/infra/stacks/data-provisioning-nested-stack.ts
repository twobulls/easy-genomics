import { marshall } from '@aws-sdk/util-dynamodb';
import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import {
  laboratory,
  laboratoryUser,
  organization,
  organizationUser,
  user,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/sample-data';
import { UniqueReference } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/unique-reference';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { AwsCustomResource, AwsCustomResourcePolicy } from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { CognitoUserConstruct } from '../constructs/cognito-user-construct';
import { DataProvisioningNestedStackProps } from '../types/back-end-stack';

export class DataProvisioningNestedStack extends NestedStack {
  private props: DataProvisioningNestedStackProps;
  private cognitoUserConstruct: CognitoUserConstruct;

  constructor(scope: Construct, id: string, props: DataProvisioningNestedStackProps) {
    super(scope, id, props);
    this.props = props;

    // Setup Cognito User Construct
    this.cognitoUserConstruct = new CognitoUserConstruct(this, `${this.props.constructNamespace}-cognito-user`, {
      constructNamespace: this.props.constructNamespace,
      devEnv: this.props.devEnv,
      userPool: this.props.userPool,
    });

    try {
      // Add System Admin User Account
      this.cognitoUserConstruct.addUser(
        this.props.systemAdminEmail,
        this.props.systemAdminPassword,
        this.props.userPoolSystemAdminGroupName,
      );
    } catch (err: unknown) {
      console.error('Unable to create System Admin User Account: ', err);
    }

    if (this.props.devEnv) {
      const uniqueReferences: UniqueReference[] = [];

      // Add seed data to DynamoDB Tables
      this.addDynamoDBSeedData<Organization>(`${this.props.namePrefix}-organization-table`, organization);
      uniqueReferences.push({
        Value: organization.Name.toLowerCase(),
        Type: 'organization-name',
      });

      this.addDynamoDBSeedData<Laboratory>(`${this.props.namePrefix}-laboratory-table`, laboratory);
      uniqueReferences.push({
        Value: laboratory.Name.toLowerCase(),
        Type: `organization-${laboratory.OrganizationId}-laboratory-name`,
      });

      if (this.props.testUserEmail && this.props.testUserPassword) {
        try {
          // Add test user to Cognito User Pool
          this.cognitoUserConstruct.addUser(this.props.testUserEmail, this.props.testUserPassword);

          this.addDynamoDBSeedData<User>(`${this.props.namePrefix}-user-table`, {
            ...user,
            Email: this.props.testUserEmail,
          });

          uniqueReferences.push({
            Value: user.Email.toLowerCase(),
            Type: 'user-email',
          });
        } catch (err: unknown) {
          console.error('Unable to create Test User Account: ', err);
        }

        // Add User mapping data to DynamoDB Tables
        this.addDynamoDBSeedData<OrganizationUser>(
          `${this.props.namePrefix}-organization-user-table`,
          organizationUser,
        );
        this.addDynamoDBSeedData<LaboratoryUser>(`${this.props.namePrefix}-laboratory-user-table`, laboratoryUser);
      }

      // Bulk add unique references to UniqueReferences DynamoDB Table
      this.bulkAddDynamoDBSeedData<UniqueReference>(
        `${this.props.namePrefix}-unique-reference-table`,
        uniqueReferences,
      );
    }
  }

  private addDynamoDBSeedData<T>(tableName: string, testRecord: T) {
    const table: Table | undefined = this.props.dynamoDBTables.get(tableName);

    if (table) {
      new AwsCustomResource(this, `${tableName}_InitData`, {
        onCreate: {
          service: 'DynamoDB',
          action: 'putItem',
          parameters: {
            TableName: tableName,
            Item: marshall(testRecord),
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
      const batchItems = testRecords.map((testRecord) => {
        return { PutRequest: { Item: marshall(testRecord) } };
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
