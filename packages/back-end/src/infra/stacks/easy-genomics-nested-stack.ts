import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/persistence/easy-genomics/laboratory';
import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/persistence/easy-genomics/laboratory-user';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/persistence/easy-genomics/organization';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/persistence/easy-genomics/organization-user';
import {
  laboratory,
  laboratoryUser,
  organization,
  organizationUser,
  user,
} from '@easy-genomics/shared-lib/src/app/types/persistence/easy-genomics/sample-data';
import { User } from '@easy-genomics/shared-lib/src/app/types/persistence/easy-genomics/user';
import { NestedStack } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { baseLSIAttributes, DynamoConstruct } from '../constructs/dynamodb-construct';
import { LambdaConstruct } from '../constructs/lambda-construct';
import { EasyGenomicsNestedStackProps } from '../types/back-end-stack';

export class EasyGenomicsNestedStack extends NestedStack {
  readonly props: EasyGenomicsNestedStackProps;
  readonly dynamoDBTables: Map<string, Table> = new Map();
  readonly s3Buckets: Map<string, Bucket> = new Map();

  constructor(scope: Construct, id: string, props: EasyGenomicsNestedStackProps) {
    super(scope, id, props);
    this.props = props;

    this.setupDynamoDBTables();
    this.setupS3Buckets();
    this.setupRestApiEndpoints();
  }

  // Easy Genomics specific DynamoDB tables
  private setupDynamoDBTables = () => {
    const dynamoDB = new DynamoConstruct(this, `${this.props.constructNamespace}-dynamodb`, {
      envName: this.props.envName,
      devEnv: this.props.devEnv,
    });

    /** Update the definitions below to update / add additional DynamoDB tables **/

    // Organization table
    const organizationTableName = `${this.props.envName}-organization-table`;
    const organizationTable = dynamoDB.createTable<Organization>(
      organizationTableName,
      {
        partitionKey: {
          name: 'Id',
          type: AttributeType.STRING,
        },
        lsi: baseLSIAttributes,
      },
      this.props.devEnv,
      organization, // Seed data
    );
    this.dynamoDBTables.set(organizationTableName, organizationTable);

    // Laboratory table
    const laboratoryTableName = `${this.props.envName}-laboratory-table`;
    const laboratoryTable = dynamoDB.createTable<Laboratory>(
      laboratoryTableName,
      {
        partitionKey: {
          name: 'OrganizationId',
          type: AttributeType.STRING,
        },
        sortKey: {
          name: 'Id',
          type: AttributeType.STRING,
        },
        gsi: [{
          partitionKey: {
            name: 'Id', // Global Secondary Index to support REST API get / update / delete requests
            type: AttributeType.STRING,
          },
        }],
        lsi: baseLSIAttributes,
      },
      this.props.devEnv,
      laboratory, // Seed data
    );
    this.dynamoDBTables.set(laboratoryTableName, laboratoryTable);

    // User table
    const userTableName = `${this.props.envName}-user-table`;
    const userTable = dynamoDB.createTable<User>(
      userTableName,
      {
        partitionKey: {
          name: 'Id',
          type: AttributeType.STRING,
        },
        gsi: [
          {
            partitionKey: {
              name: 'Email', // Global Secondary Index to support lookup by Email requests
              type: AttributeType.STRING,
            },
          },
        ],
        lsi: baseLSIAttributes,
      },
      this.props.devEnv,
      user, // Seed data
    );
    this.dynamoDBTables.set(userTableName, userTable);

    // Organization User table
    const organizationUserTableName = `${this.props.envName}-organization-user-table`;
    const organizationUserTable = dynamoDB.createTable<OrganizationUser>(
      organizationUserTableName,
      {
        partitionKey: {
          name: 'OrganizationId', // UUID
          type: AttributeType.STRING,
        },
        sortKey: {
          name: 'UserId', // UUID
          type: AttributeType.STRING,
        },
        gsi: [
          {
            partitionKey: {
              name: 'UserId', // Global Secondary Index to support Organization lookup by UserId requests
              type: AttributeType.STRING,
            },
          },
        ],
        lsi: baseLSIAttributes,
      },
      this.props.devEnv,
      organizationUser, // Seed data
    );
    this.dynamoDBTables.set(organizationUserTableName, organizationUserTable);

    // Laboratory User table
    const laboratoryUserTableName = `${this.props.envName}-laboratory-user-table`;
    const laboratoryUserTable = dynamoDB.createTable<LaboratoryUser>(
      laboratoryUserTableName,
      {
        partitionKey: {
          name: 'LaboratoryId',
          type: AttributeType.STRING,
        },
        sortKey: {
          name: 'UserId',
          type: AttributeType.STRING,
        },
        gsi: [
          {
            partitionKey: {
              name: 'UserId', // Global Secondary Index to support Laboratory lookup by UserId requests
              type: AttributeType.STRING,
            },
          },
        ],
        lsi: baseLSIAttributes,
      },
      this.props.devEnv,
      laboratoryUser, // Seed data
    );
    this.dynamoDBTables.set(laboratoryUserTableName, laboratoryUserTable);
  };

  // Easy Genomics specific S3 Buckets
  private setupS3Buckets = () => {};

  // Easy Genomics specific REST API endpoints / Lambda Functions
  private setupRestApiEndpoints = () => {
    new LambdaConstruct(this, `${this.props.constructNamespace}-lambda`, {
      ...this.props,
      lambdaFunctionsDir: 'src/app/controllers/easy-genomics',
      lambdaFunctionsNamespace: `${this.props.constructNamespace}-lambda`,
      lambdaFunctionsResources: {}, // Used for setting specific resources for a given Lambda function (e.g. environment settings, trigger events)
      lambdaTimeoutInSeconds: this.props.lambdaTimeoutInSeconds,
      environment: {
        ENV_NAME: this.props.envName,
        AWS_ACCOUNT_ID: this.props.env.account!,
      },
    });
  };
}
