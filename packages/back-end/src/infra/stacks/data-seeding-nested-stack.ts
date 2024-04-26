import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import { laboratory, laboratoryUser, organization, organizationUser, uniqueReferences, user } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/sample-data';
import { UniqueReference } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/unique-reference';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
import { NestedStack, RemovalPolicy } from 'aws-cdk-lib';
import { Table } from 'aws-cdk-lib/aws-dynamodb';
import { AwsCustomResource, AwsCustomResourcePolicy } from 'aws-cdk-lib/custom-resources';
import { DynamoDB } from 'aws-sdk';
import { Construct } from 'constructs';
import { DataSeedingNestedStackProps } from '../types/back-end-stack';

export class DataSeedingNestedStack extends NestedStack {
  readonly props: DataSeedingNestedStackProps;

  constructor(scope: Construct, id: string, props: DataSeedingNestedStackProps) {
    super(scope, id, props);
    this.props = props;

    // this.setupSystemAdmin();
    if (this.props.devEnv) {
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
