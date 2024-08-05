import { NestedStack } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { baseLSIAttributes, DynamoConstruct } from '../constructs/dynamodb-construct';
import { IamConstruct, IamConstructProps } from '../constructs/iam-construct';
import { LambdaConstruct } from '../constructs/lambda-construct';
import { AwsHealthOmicsNestedStackProps } from '../types/back-end-stack';

export class AwsHealthOmicsNestedStack extends NestedStack {
  readonly props: AwsHealthOmicsNestedStackProps;
  dynamoDBTables: Map<string, Table> = new Map();
  dynamoDB: DynamoConstruct;
  iam: IamConstruct;
  lambda: LambdaConstruct;

  constructor(scope: Construct, id: string, props: AwsHealthOmicsNestedStackProps) {
    super(scope, id, props);
    this.props = props;

    this.iam = new IamConstruct(this, `${this.props.constructNamespace}-iam`, {
      ...(<IamConstructProps>props), // Typecast to IamConstructProps
    });
    this.setupIamPolicies();

    this.dynamoDB = new DynamoConstruct(this, `${this.props.constructNamespace}-dynamodb`, {
      devEnv: this.props.devEnv,
    });
    this.setupDynamoDBTables();

    this.lambda = new LambdaConstruct(this, `${this.props.constructNamespace}`, {
      ...this.props,
      iamPolicyStatements: this.iam.policyStatements, // Pass declared Auth IAM policies for attaching to respective Lambda function
      lambdaFunctionsDir: 'src/app/controllers/aws-healthomics',
      lambdaFunctionsNamespace: `${this.props.constructNamespace}`,
      lambdaFunctionsResources: {}, // Used for setting specific resources for a given Lambda function (e.g. environment settings, trigger events)
      environment: {
        // Defines the common environment settings for all lambda functions
        ACCOUNT_ID: this.props.env.account!,
        REGION: this.props.env.region!,
        DOMAIN_NAME: this.props.appDomainName,
        NAME_PREFIX: this.props.namePrefix,
      },
    });
  }

  // AWS HealthOmics specific IAM policies
  private setupIamPolicies = () => {
    // /aws-healthomics/private-workflow/create-private-workflow
    this.iam.addPolicyStatements('/aws-healthomics/private-workflow/create-private-workflow', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table`,
        ],
        actions: ['dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /aws-healthomics/private-workflow/list-private-workflows
    this.iam.addPolicyStatements('/aws-healthomics/private-workflow/list-private-workflows', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table`,
        ],
        actions: ['dynamodb:Scan'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /aws-healthomics/private-workflow/request-private-workflow
    this.iam.addPolicyStatements('/aws-healthomics/private-workflow/request-private-workflow', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table`,
        ],
        actions: ['dynamodb:GetItem'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /aws-healthomics/private-workflow/read-private-workflow
    this.iam.addPolicyStatements('/aws-healthomics/private-workflow/read-private-workflow', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /aws-healthomics/private-workflow/update-private-workflow
    this.iam.addPolicyStatements('/aws-healthomics/private-workflow/update-private-workflow', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table/index/*`,
        ],
        actions: ['dynamodb:Query', 'dynamodb:UpdateItem'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /aws-healthomics/private-workflow/delete-private-workflow
    this.iam.addPolicyStatements('/aws-healthomics/private-workflow/delete-private-workflow', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-healthomics-private-workflow-table/index/*`,
        ],
        actions: ['dynamodb:DeleteItem', 'dynamodb:Query'],
        effect: Effect.ALLOW,
      }),
    ]);
  };

  // AWS HealthOmics specific DynamoDB tables
  private setupDynamoDBTables = () => {
    /** Update the definitions below to update / add additional DynamoDB tables **/
    // AWS HealthOmics Private Workflow table - used for tracking the creation & setup of private workflows to add to AWS HealthOmics
    const awsHealthOmicsPrivateWorkflowsTableName = `${this.props.namePrefix}-healthomics-private-workflow-table`;
    const awsHealthOmicsPrivateWorkflowsTable = this.dynamoDB.createTable(
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
        gsi: [
          {
            partitionKey: {
              name: 'PrivateWorkflowId', // Global Secondary Index to support REST API get / update / delete requests
              type: AttributeType.STRING,
            },
          },
        ],
        lsi: baseLSIAttributes,
      },
      this.props.devEnv,
    );
    this.dynamoDBTables.set(awsHealthOmicsPrivateWorkflowsTableName, awsHealthOmicsPrivateWorkflowsTable);
  };
}
