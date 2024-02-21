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
import { DynamoConstruct } from '../constructs/dynamodb-construct';
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
          name: 'OrganizationId', // UUID
          type: AttributeType.STRING,
        },
      },
      this.props.devEnv,
      organization, // Seed data
    );
    this.dynamoDBTables.set(organizationTableName, organizationTable);

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
              name: 'UserId',
              type: AttributeType.STRING,
            },
          },
        ],
      },
      this.props.devEnv,
      organizationUser, // Seed data
    );
    this.dynamoDBTables.set(organizationUserTableName, organizationUserTable);

    // User table
    const userTableName = `${this.props.envName}-user-table`;
    const userTable = dynamoDB.createTable<User>(
      userTableName,
      {
        partitionKey: {
          name: 'UserId', // UUID
          type: AttributeType.STRING,
        },
        gsi: [
          {
            partitionKey: {
              name: 'UserId',
              type: AttributeType.STRING,
            },
          },
        ],
      },
      this.props.devEnv,
      user, // Seed data
    );
    this.dynamoDBTables.set(userTableName, userTable);

    // Laboratory table
    const laboratoryTableName = `${this.props.envName}-laboratory-table`;
    const laboratoryTable = dynamoDB.createTable<Laboratory>(
      laboratoryTableName,
      {
        partitionKey: {
          name: 'OrganizationId', // UUID
          type: AttributeType.STRING,
        },
        sortKey: {
          name: 'LaboratoryId', // UUID
          type: AttributeType.STRING,
        },
        lsi: [
          {
            name: 'Name',
            type: AttributeType.STRING,
          },
        ],
      },
      this.props.devEnv,
      laboratory, // Seed data
    );
    this.dynamoDBTables.set(laboratoryTableName, laboratoryTable);

    // Laboratory User table
    const laboratoryUserTableName = `${this.props.envName}-laboratory-user-table`;
    const laboratoryUserTable = dynamoDB.createTable<LaboratoryUser>(
      laboratoryUserTableName,
      {
        partitionKey: {
          name: 'LaboratoryId', // UUID
          type: AttributeType.STRING,
        },
        sortKey: {
          name: 'UserId', // UUID
          type: AttributeType.STRING,
        },
        gsi: [
          {
            partitionKey: {
              name: 'UserId',
              type: AttributeType.STRING,
            },
          },
        ],
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
      restApi: this.props.restApi,
      userPool: this.props.userPool,
      lambdaFunctionsDir: 'src/app/controllers',
      lambdaFunctionsNamespace: `${this.props.constructNamespace}-lambda`,
      lambdaFunctionsResources: { // Attach relevant IAM Policies
        ['/easy-genomics/organization']: {
          policies: [this.props.iamPolicyStatements.get('dynamodb-organization-table-crud-access-policy-statement')!],
        },
        ['/easy-genomics/laboratory']: {
          policies: [this.props.iamPolicyStatements.get('dynamodb-laboratory-table-crud-access-policy-statement')!],
        },
        ['/easy-genomics/user']: {
          policies: [this.props.iamPolicyStatements.get('dynamodb-user-table-crud-access-policy-statement')!],
        },
      },
      lambdaTimeoutInSeconds: this.props.lambdaTimeoutInSeconds,
      environment: {
        ENV_NAME: this.props.envName,
      },
    });
  };
}
