import { PrivateWorkflow } from '@easy-genomics/shared-lib/src/app/types/persistence/aws-healthomics/private-workflow';
import { NestedStack } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';
import { DynamoConstruct } from '../constructs/dynamodb-construct';
import { LambdaConstruct } from '../constructs/lambda-construct';
import { AwsHealthOmicsNestedStackProps } from '../types/back-end-stack';

export class AwsHealthOmicsNestedStack extends NestedStack {
  readonly props: AwsHealthOmicsNestedStackProps;
  readonly dynamoDBTables: Map<string, Table> = new Map();

  constructor(scope: Construct, id: string, props: AwsHealthOmicsNestedStackProps) {
    super(scope, id, props);
    this.props = props;

    this.setupDynamoDBTables();
    this.setupRestApiEndpoints();
  }

  // AWS HealthOmics specific REST API endpoints / Lambda Functions
  private setupRestApiEndpoints = () => {
    new LambdaConstruct(this, `${this.props.constructNamespace}-lambda`, {
      ...this.props,
      lambdaFunctionsDir: 'src/app/controllers/aws-healthomics',
      lambdaFunctionsNamespace: `${this.props.constructNamespace}-lambda`,
      lambdaFunctionsResources: {}, // Used for setting specific resources for a given Lambda function (e.g. environment settings, trigger events)
      lambdaTimeoutInSeconds: this.props.lambdaTimeoutInSeconds,
      environment: {
        ENV_NAME: this.props.envName,
        AWS_ACCOUNT_ID: this.props.env.account!,
      },
    });
  };

  // AWS HealthOmics specific DynamoDB tables
  private setupDynamoDBTables = () => {
    const dynamoDB = new DynamoConstruct(this, `${this.props.constructNamespace}-dynamodb`, {
      envName: this.props.envName,
      devEnv: this.props.devEnv,
    });

    /** Update the definitions below to update / add additional DynamoDB tables **/

    // AWS HealthOmics Private Workflow table - used for tracking the creation & setup of private workflows to add to AWS HealthOmics
    const awsHealthOmicsPrivateWorkflowsTableName = `${this.props.envName}-healthomics-private-workflow-table`;
    const awsHealthOmicsPrivateWorkflowsTable = dynamoDB.createTable<PrivateWorkflow>(
      awsHealthOmicsPrivateWorkflowsTableName,
      {
        partitionKey: {
          name: 'Url', // Workflow Repository URL
          type: AttributeType.STRING,
        },
        sortKey: {
          name: 'Version', // Workflow Release Version
          type: AttributeType.STRING,
        },
        gsi: [{
          partitionKey: {
            name: 'Id', // Global Secondary Index to support REST API get / update / delete requests
            type: AttributeType.STRING,
          },
        }],
      },
      this.props.devEnv,
    );
    this.dynamoDBTables.set(awsHealthOmicsPrivateWorkflowsTableName, awsHealthOmicsPrivateWorkflowsTable);
  };
}
