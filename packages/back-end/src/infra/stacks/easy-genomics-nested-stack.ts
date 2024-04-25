import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
import { LaboratoryUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory-user';
import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
import { OrganizationUser } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user';
import {
  laboratory,
  laboratoryUser,
  organization,
  organizationUser,
  uniqueReferences,
  user,
} from '@easy-genomics/shared-lib/src/app/types/easy-genomics/sample-data';
import { UniqueReference } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/unique-reference';
import { User } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/user';
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
      devEnv: this.props.devEnv,
    });

    /** Update the definitions below to update / add additional DynamoDB tables **/

    // Organization table
    const organizationTableName = `${this.props.namePrefix}-organization-table`;
    const organizationTable = dynamoDB.createTable<Organization>(
      organizationTableName,
      {
        partitionKey: {
          name: 'OrganizationId',
          type: AttributeType.STRING,
        },
        lsi: baseLSIAttributes,
      },
      this.props.devEnv,
      organization, // Seed data
    );
    this.dynamoDBTables.set(organizationTableName, organizationTable);

    // Laboratory table
    const laboratoryTableName = `${this.props.namePrefix}-laboratory-table`;
    const laboratoryTable = dynamoDB.createTable<Laboratory>(
      laboratoryTableName,
      {
        partitionKey: {
          name: 'OrganizationId',
          type: AttributeType.STRING,
        },
        sortKey: {
          name: 'LaboratoryId',
          type: AttributeType.STRING,
        },
        gsi: [{
          partitionKey: {
            name: 'LaboratoryId', // Global Secondary Index to support REST API get / update / delete requests
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
    const userTableName = `${this.props.namePrefix}-user-table`;
    const userTable = dynamoDB.createTable<User>(
      userTableName,
      {
        partitionKey: {
          name: 'UserId',
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
    const organizationUserTableName = `${this.props.namePrefix}-organization-user-table`;
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
    const laboratoryUserTableName = `${this.props.namePrefix}-laboratory-user-table`;
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

    // Unique-Reference table
    const uniqueReferenceTableName = `${this.props.namePrefix}-unique-reference-table`;
    const uniqueReferenceTable = dynamoDB.createTable<UniqueReference>(
      uniqueReferenceTableName,
      {
        partitionKey: {
          name: 'Value',
          type: AttributeType.STRING,
        },
        sortKey: {
          name: 'Type',
          type: AttributeType.STRING,
        },
      },
      this.props.devEnv,
      uniqueReferences, // Seed data
    );
    this.dynamoDBTables.set(uniqueReferenceTableName, uniqueReferenceTable);
  };

  // Easy Genomics specific S3 Buckets
  private setupS3Buckets = () => {};

  // Easy Genomics specific REST API endpoints / Lambda Functions
  private setupRestApiEndpoints = () => {
    new LambdaConstruct(this, `${this.props.constructNamespace}`, {
      ...this.props,
      lambdaFunctionsDir: 'src/app/controllers/easy-genomics',
      lambdaFunctionsNamespace: `${this.props.constructNamespace}`,
      lambdaFunctionsResources: {}, // Used for setting specific resources for a given Lambda function (e.g. environment settings, trigger events)
      environment: {
        AWS_ACCOUNT_ID: this.props.env.account!,
        NAME_PREFIX: this.props.namePrefix,
      },
    });
  };
}
