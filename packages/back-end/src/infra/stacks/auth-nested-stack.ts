import { NestedStack } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { CognitoIdpConstruct } from '../constructs/cognito-idp-construct';
import { DynamoConstruct } from '../constructs/dynamodb-construct';
import { IamConstruct, IamConstructProps } from '../constructs/iam-construct';
import { LambdaConstruct } from '../constructs/lambda-construct';
import { AuthNestedStackProps } from '../types/back-end-stack';

export class AuthNestedStack extends NestedStack {
  readonly props: AuthNestedStackProps;
  dynamoDBTables: Map<string, Table> = new Map();
  dynamoDB: DynamoConstruct;
  iam: IamConstruct;
  lambda: LambdaConstruct;
  cognito: CognitoIdpConstruct;

  constructor(scope: Construct, id: string, props: AuthNestedStackProps) {
    super(scope, id, props);
    this.props = props;

    this.iam = new IamConstruct(this, `${this.props.constructNamespace}-iam`, {
      ...<IamConstructProps>props, // Typecast to IamConstructProps
    });
    this.setupIamPolicies();

    this.dynamoDB = new DynamoConstruct(this, `${this.props.constructNamespace}-dynamodb`, {
      devEnv: this.props.devEnv,
    });
    this.setupDynamoDBTables();

    this.lambda = new LambdaConstruct(this, `${this.props.constructNamespace}-lambdas`, {
      ...this.props,
      iamPolicyStatements: this.iam.policyStatements, // Pass declared Auth IAM policies for attaching to respective Lambda function
      lambdaFunctionsDir: 'src/app/controllers/auth',
      lambdaFunctionsNamespace: `${this.props.constructNamespace}`,
      lambdaFunctionsResources: {}, // Used for setting specific resources for a given Lambda function (e.g. environment settings, trigger events)
      environment: {
        AWS_ACCOUNT_ID: this.props.env.account!,
        NAME_PREFIX: this.props.namePrefix,
      },
    });

    // Setup Cognito IDP and make it accessible by other Nested Stacks
    this.cognito = new CognitoIdpConstruct(this, `${this.props.constructNamespace}-cognito-idp`, {
      constructNamespace: this.props.constructNamespace,
      devEnv: this.props.devEnv,
      authLambdaFunctions: this.lambda.lambdaFunctions, // Pass Auth Lambda functions for registering with Cognito Event triggers
    });
  }

  // Auth specific IAM policies
  private setupIamPolicies = () => {
    // /auth/process-post-authentication
    this.iam.addPolicyStatements(
      '/auth/process-post-authentication',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-authentication-log-table`,
          ],
          actions: ['dynamodb:PutItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
  };

  // Auth specific DynamoDB tables
  private setupDynamoDBTables = () => {
    /** Update the definitions below to update / add additional DynamoDB tables **/
    // Authentication-Log Table
    const authenticationLogTableName = `${this.props.namePrefix}-authentication-log-table`;
    const authenticationLogTable = this.dynamoDB.createTable(
      authenticationLogTableName,
      {
        partitionKey: {
          name: 'Username',
          type: AttributeType.STRING,
        },
        sortKey: {
          name: 'DateTime',
          type: AttributeType.NUMBER,
        },
      },
      this.props.devEnv,
    );
    this.dynamoDBTables.set(authenticationLogTableName, authenticationLogTable);
  };

}
