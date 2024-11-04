import { Duration, NestedStack } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';
import { baseLSIAttributes, DynamoConstruct } from '../constructs/dynamodb-construct';
import { IamConstruct, IamConstructProps } from '../constructs/iam-construct';
import { LambdaConstruct } from '../constructs/lambda-construct';
import { SesConstruct } from '../constructs/ses-construct';
import { SnsConstruct, TopicDetails, Topics } from '../constructs/sns-construct';
import { QueueDetails, Queues, SqsConstruct } from '../constructs/sqs-construct';
import { EasyGenomicsNestedStackProps } from '../types/back-end-stack';

export class EasyGenomicsNestedStack extends NestedStack {
  readonly props: EasyGenomicsNestedStackProps;
  readonly dynamoDBTables: Map<string, Table> = new Map();

  dynamoDB: DynamoConstruct;
  iam: IamConstruct;
  lambda: LambdaConstruct;
  ses: SesConstruct;
  sns: SnsConstruct;
  sqs: SqsConstruct;

  constructor(scope: Construct, id: string, props: EasyGenomicsNestedStackProps) {
    super(scope, id);
    this.props = props;

    this.sns = new SnsConstruct(this, `${this.props.constructNamespace}-sns`, {
      namePrefix: this.props.namePrefix,
      topics: <Topics>{
        ['organization-deletion-topic']: <TopicDetails>{ fifo: true },
        ['laboratory-deletion-topic']: <TopicDetails>{ fifo: true },
      },
    });

    this.sqs = new SqsConstruct(this, `${this.props.constructNamespace}-sqs`, {
      namePrefix: this.props.namePrefix,
      devEnv: this.props.devEnv,
      queues: <Queues>{
        ['organization-management-queue']: <QueueDetails>{
          fifo: true,
          retentionPeriod: Duration.days(1),
          visibilityTimeout: Duration.minutes(15),
          snsTopics: [this.sns.snsTopics.get('organization-deletion-topic')],
        },
        ['laboratory-management-queue']: <QueueDetails>{
          fifo: true,
          retentionPeriod: Duration.days(1),
          visibilityTimeout: Duration.minutes(15),
          snsTopics: [this.sns.snsTopics.get('laboratory-deletion-topic')],
        },
      },
    });

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
      iamPolicyStatements: this.iam.policyStatements, // Pass declared Easy Genomics IAM policies for attaching to respective Lambda function
      lambdaFunctionsDir: 'src/app/controllers/easy-genomics',
      lambdaFunctionsNamespace: `${this.props.constructNamespace}`,
      lambdaFunctionsResources: {
        // Used for setting specific resources for a given Lambda function (e.g. environment settings, trigger events)
        '/easy-genomics/user/create-user-invitation-request': {
          environment: {
            COGNITO_USER_POOL_CLIENT_ID: this.props.userPoolClient?.userPoolClientId!,
            COGNITO_USER_POOL_ID: this.props.userPool?.userPoolId!,
            JWT_SECRET_KEY: this.props.jwtSecretKey,
          },
        },
        '/easy-genomics/user/confirm-user-invitation-request': {
          environment: {
            COGNITO_KMS_KEY_ID: this.props.cognitoIdpKmsKey?.keyId!,
            COGNITO_KMS_KEY_ARN: this.props.cognitoIdpKmsKey?.keyArn!,
            COGNITO_USER_POOL_CLIENT_ID: this.props.userPoolClient?.userPoolClientId!,
            COGNITO_USER_POOL_ID: this.props.userPool?.userPoolId!,
            JWT_SECRET_KEY: this.props.jwtSecretKey,
          },
          methodOptions: {
            // apiKeyRequired: true,
            authorizer: undefined, // Explicitly remove authorizer
          },
        },
        '/easy-genomics/user/create-user-forgot-password-request': {
          environment: {
            COGNITO_USER_POOL_CLIENT_ID: this.props.userPoolClient?.userPoolClientId!,
            COGNITO_USER_POOL_ID: this.props.userPool?.userPoolId!,
          },
          methodOptions: {
            // apiKeyRequired: true,
            authorizer: undefined, // Explicitly remove authorizer
          },
        },
        '/easy-genomics/user/confirm-user-forgot-password-request': {
          environment: {
            COGNITO_KMS_KEY_ID: this.props.cognitoIdpKmsKey?.keyId!,
            COGNITO_KMS_KEY_ARN: this.props.cognitoIdpKmsKey?.keyArn!,
            COGNITO_USER_POOL_CLIENT_ID: this.props.userPoolClient?.userPoolClientId!,
            COGNITO_USER_POOL_ID: this.props.userPool?.userPoolId!,
            JWT_SECRET_KEY: this.props.jwtSecretKey,
          },
          methodOptions: {
            // apiKeyRequired: true,
            authorizer: undefined, // Explicitly remove authorizer
          },
        },
        '/easy-genomics/organization/delete-organization': {
          environment: {
            SNS_ORGANIZATION_DELETION_TOPIC: this.sns.snsTopics.get('organization-deletion-topic')?.topicArn || '',
          },
        },
        '/easy-genomics/organization/process-delete-organization': {
          events: [new SqsEventSource(this.sqs.sqsQueues.get('organization-management-queue')!, { batchSize: 1 })],
          environment: {
            SNS_ORGANIZATION_DELETION_TOPIC: this.sns.snsTopics.get('organization-deletion-topic')?.topicArn || '',
          },
        },
        '/easy-genomics/laboratory/create-laboratory': {
          environment: {
            SEQERA_API_BASE_URL: this.props.seqeraApiBaseUrl,
          },
        },
        '/easy-genomics/laboratory/update-laboratory': {
          environment: {
            SEQERA_API_BASE_URL: this.props.seqeraApiBaseUrl,
          },
        },
      },
      environment: {
        // Defines the common environment settings for all lambda functions
        ACCOUNT_ID: this.props.env.account!,
        REGION: this.props.env.region!,
        DOMAIN_NAME: this.props.appDomainName,
        ENV_TYPE: this.props.envType,
        NAME_PREFIX: this.props.namePrefix,
      },
    });

    this.ses = new SesConstruct(this, `${this.props.constructNamespace}-ses`, {
      awsAccount: this.props.env.account!,
      awsRegion: this.props.env.region!,
      appDomainName: this.props.appDomainName,
      awsHostedZoneId: this.props.awsHostedZoneId,
      emailSender: `no.reply@${this.props.appDomainName}`,
    });
  }

  // Easy Genomics specific IAM policies
  private setupIamPolicies = () => {
    // /easy-genomics/organization/create-organization
    this.iam.addPolicyStatements('/easy-genomics/organization/create-organization', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`,
        ],
        actions: ['dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/organization/read-organization
    this.iam.addPolicyStatements('/easy-genomics/organization/read-organization', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`,
        ],
        actions: ['dynamodb:GetItem'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/organization/list-organizations
    this.iam.addPolicyStatements('/easy-genomics/organization/list-organizations', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`,
        ],
        actions: ['dynamodb:Scan'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/organization/update-organization
    this.iam.addPolicyStatements('/easy-genomics/organization/update-organization', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`,
        ],
        actions: ['dynamodb:GetItem', 'dynamodb:UpdateItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`,
        ],
        actions: ['dynamodb:DeleteItem', 'dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/organization/delete-organization
    this.iam.addPolicyStatements('/easy-genomics/organization/delete-organization', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`,
        ],
        actions: ['dynamodb:DeleteItem', 'dynamodb:GetItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`,
        ],
        actions: ['dynamodb:DeleteItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table/index/*`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [`${this.sns.snsTopics.get('organization-deletion-topic')?.topicArn || ''}`],
        actions: ['sns:Publish'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/organization/process-delete-organization
    this.iam.addPolicyStatements('/easy-genomics/organization/process-delete-organization', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
        ],
        actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
        ],
        actions: ['dynamodb:DeleteItem'],
        effect: Effect.ALLOW,
      }),
    ]);

    // /easy-genomics/organization/user/add-organization-user
    this.iam.addPolicyStatements('/easy-genomics/organization/user/add-organization-user', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
        ],
        actions: ['dynamodb:GetItem'],
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
        ],
        actions: ['dynamodb:PutItem'],
      }),
    ]);
    // /easy-genomics/organization/user/edit-organization-user
    this.iam.addPolicyStatements('/easy-genomics/organization/user/edit-organization-user', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
        ],
        actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
        ],
        actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/organization/user/list-organization-users
    this.iam.addPolicyStatements('/easy-genomics/organization/user/list-organization-users', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
      }),
    ]);
    // /easy-genomics/organization/user/list-organization-users-details
    this.iam.addPolicyStatements('/easy-genomics/organization/user/list-organization-users-details', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table/index/*`,
        ],
        actions: ['dynamodb:BatchGetItem'],
      }),
    ]);
    // /easy-genomics/organization/user/request-organization-user
    this.iam.addPolicyStatements('/easy-genomics/organization/user/request-organization-user', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
        ],
        actions: ['dynamodb:GetItem'],
      }),
    ]);
    // /easy-genomics/organization/user/remove-organization-user
    this.iam.addPolicyStatements('/easy-genomics/organization/user/remove-organization-user', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
        ],
        actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
        ],
        actions: ['dynamodb:DeleteItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
        ],
        actions: ['dynamodb:GetItem', 'dynamodb:DeleteItem'],
        effect: Effect.ALLOW,
      }),
    ]);

    // /easy-genomics/laboratory/create-laboratory
    this.iam.addPolicyStatements('/easy-genomics/laboratory/create-laboratory', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`,
        ],
        actions: ['dynamodb:GetItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`,
        ],
        actions: ['dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:ssm:${this.props.env.region!}:${this.props.env.account!}:parameter/easy-genomics/organization/*/laboratory/*/nf-access-token`,
        ],
        actions: ['ssm:PutParameter'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/laboratory/read-laboratory
    this.iam.addPolicyStatements('/easy-genomics/laboratory/read-laboratory', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:ssm:${this.props.env.region!}:${this.props.env.account!}:parameter/easy-genomics/organization/*/laboratory/*/nf-access-token`,
        ],
        actions: ['ssm:GetParameter'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/laboratory/request-laboratory
    this.iam.addPolicyStatements('/easy-genomics/laboratory/request-laboratory', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
        ],
        actions: ['dynamodb:GetItem'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/laboratory/list-laboratories
    this.iam.addPolicyStatements('/easy-genomics/laboratory/list-laboratories', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/laboratory/update-laboratory
    this.iam.addPolicyStatements('/easy-genomics/laboratory/update-laboratory', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
        ],
        actions: ['dynamodb:Query', 'dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`,
        ],
        actions: ['dynamodb:DeleteItem', 'dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: ['arn:aws:s3:::*'],
        actions: ['s3:GetBucketLocation'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:ssm:${this.props.env.region!}:${this.props.env.account!}:parameter/easy-genomics/organization/*/laboratory/*/nf-access-token`,
        ],
        actions: ['ssm:GetParameter', 'ssm:PutParameter'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/laboratory/delete-laboratory
    this.iam.addPolicyStatements('/easy-genomics/laboratory/delete-laboratory', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
        ],
        actions: ['dynamodb:DeleteItem', 'dynamodb:Query'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`,
        ],
        actions: ['dynamodb:DeleteItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:ssm:${this.props.env.region!}:${this.props.env.account!}:parameter/easy-genomics/organization/*/laboratory/*/nf-access-token`,
        ],
        actions: ['ssm:DeleteParameter'],
        effect: Effect.ALLOW,
      }),
    ]);

    // /easy-genomics/laboratory/user/add-laboratory-user
    this.iam.addPolicyStatements('/easy-genomics/laboratory/user/add-laboratory-user', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
        ],
        actions: ['dynamodb:GetItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
        ],
        actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
        ],
        actions: ['dynamodb:GetItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
        ],
        actions: ['dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/laboratory/user/edit-laboratory-user
    this.iam.addPolicyStatements('/easy-genomics/laboratory/user/edit-laboratory-user', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
        ],
        actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
        ],
        actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/laboratory/user/list-laboratory-users
    this.iam.addPolicyStatements('/easy-genomics/laboratory/user/list-laboratory-users', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
      }),
    ]);
    // /easy-genomics/laboratory/user/list-laboratory-users-details
    this.iam.addPolicyStatements('/easy-genomics/laboratory/user/list-laboratory-users-details', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table/index/*`,
        ],
        actions: ['dynamodb:BatchGetItem'],
      }),
    ]);
    // /easy-genomics/laboratory/user/remove-laboratory-user
    this.iam.addPolicyStatements('/easy-genomics/laboratory/user/remove-laboratory-user', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
        ],
        actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
        ],
        actions: ['dynamodb:GetItem', 'dynamodb:DeleteItem'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/laboratory/user/request-laboratory-user
    this.iam.addPolicyStatements('/easy-genomics/laboratory/user/request-laboratory-user', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
        ],
        actions: ['dynamodb:GetItem'],
      }),
    ]);

    // /easy-genomics/user/create-user
    this.iam.addPolicyStatements('/easy-genomics/user/create-user', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`,
        ],
        actions: ['dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/user/list-all-users
    this.iam.addPolicyStatements('/easy-genomics/user/list-all-users', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
        ],
        actions: ['dynamodb:Scan'],
        effect: Effect.ALLOW,
      }),
    ]);

    // /easy-genomics/user/create-user-invitation-request
    this.iam.addPolicyStatements('/easy-genomics/user/create-user-invitation-request', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
        ],
        actions: ['dynamodb:GetItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
        ],
        actions: ['dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:cognito-idp:${this.props.env.region!}:${this.props.env.account!}:userpool/${this.props.userPool?.userPoolId}`,
        ],
        actions: ['cognito-idp:AdminCreateUser', 'cognito-idp:AdminUpdateUserAttributes'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:ses:${this.props.env.region!}:${this.props.env.account!}:identity/${this.props.appDomainName}`,
          `arn:aws:ses:${this.props.env.region!}:${this.props.env.account!}:identity/*@*`,
          `arn:aws:ses:${this.props.env.region!}:${this.props.env.account!}:template/*`,
        ],
        actions: ['ses:SendTemplatedEmail'],
        effect: Effect.ALLOW,
        conditions: {
          StringEquals: {
            'ses:FromAddress': `no.reply@${this.props.appDomainName}`,
          },
        },
      }),
    ]);
    // /easy-genomics/user/confirm-user-invitation-request
    this.iam.addPolicyStatements('/easy-genomics/user/confirm-user-invitation-request', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table/index/*`,
        ],
        actions: ['dynamodb:Query', 'dynamodb:PutItem', 'dynamodb:GetItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`,
        ],
        actions: ['dynamodb:DeleteItem', 'dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
        ],
        actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [this.props.cognitoIdpKmsKey?.keyArn!],
        actions: ['kms:GenerateDataKey', 'kms:Decrypt'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:cognito-idp:${this.props.env.region!}:${this.props.env.account!}:userpool/${this.props.userPool?.userPoolId}`,
        ],
        actions: [
          'cognito-idp:AdminEnableUser',
          'cognito-idp:AdminSetUserPassword',
          'cognito-idp:AdminUpdateUserAttributes',
        ],
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/user/create-user-forgot-password-request
    this.iam.addPolicyStatements('/easy-genomics/user/create-user-forgot-password-request', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:cognito-idp:${this.props.env.region!}:${this.props.env.account!}:userpool/${this.props.userPool!.userPoolId}`,
        ],
        actions: ['cognito-idp:AdminGetUser', 'cognito-idp:ForgotPassword'],
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/user/confirm-user-forgot-password-request
    this.iam.addPolicyStatements('/easy-genomics/user/confirm-user-forgot-password-request', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [this.props.cognitoIdpKmsKey?.keyArn!],
        actions: ['kms:GenerateDataKey', 'kms:Decrypt'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:cognito-idp:${this.props.env.region!}:${this.props.env.account!}:userpool/${this.props.userPool!.userPoolId}`,
        ],
        actions: ['cognito-idp:AdminGetUser', 'cognito-idp:ConfirmForgotPassword'],
        effect: Effect.ALLOW,
      }),
    ]);

    // /easy-genomics/list-buckets
    this.iam.addPolicyStatements('/easy-genomics/list-buckets', [
      new PolicyStatement({
        resources: ['arn:aws:s3:::*'],
        actions: ['s3:ListAllMyBuckets', 's3:GetBucketTagging'],
        effect: Effect.ALLOW,
      }),
    ]);

    // /easy-genomics/file/request-file-download-url
    this.iam.addPolicyStatements('/easy-genomics/file/request-file-download-url', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
      }),
      new PolicyStatement({
        resources: ['arn:aws:s3:::*'],
        actions: ['s3:GetBucketLocation'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: ['arn:aws:s3:::*/*'],
        actions: ['s3:GetObject', 's3:ListBucket'], // Required to generate pre-signed S3 Urls for downloading with GetObject request
        effect: Effect.ALLOW,
      }),
    ]);

    // /easy-genomics/upload/create-file-upload-request
    this.iam.addPolicyStatements('/easy-genomics/upload/create-file-upload-request', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
      }),
      new PolicyStatement({
        resources: ['arn:aws:s3:::*'],
        actions: ['s3:GetBucketLocation'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: ['arn:aws:s3:::*/*'],
        actions: ['s3:PutObject'], // Required to generate pre-signed S3 Urls for uploading with PutObject request
        effect: Effect.ALLOW,
      }),
    ]);
    // /easy-genomics/upload/create-file-upload-sample-sheet
    this.iam.addPolicyStatements('/easy-genomics/upload/create-file-upload-sample-sheet', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
      }),
      new PolicyStatement({
        resources: ['arn:aws:s3:::*'],
        actions: [
          's3:GetBucketLocation',
          's3:ListBucket', // Required for HeadObject command
          's3:GetObject', // Required for HeadObject command
          's3:HeadObject',
          's3:PutObject',
        ],
        effect: Effect.ALLOW,
      }),
    ]);
  };

  // Easy Genomics specific DynamoDB tables
  private setupDynamoDBTables = () => {
    /** Update the definitions below to update / add additional DynamoDB tables **/
    // Organization table
    const organizationTableName = `${this.props.namePrefix}-organization-table`;
    const organizationTable = this.dynamoDB.createTable(
      organizationTableName,
      {
        partitionKey: {
          name: 'OrganizationId',
          type: AttributeType.STRING,
        },
        lsi: baseLSIAttributes,
      },
      this.props.devEnv,
    );
    this.dynamoDBTables.set(organizationTableName, organizationTable);

    // Laboratory table
    const laboratoryTableName = `${this.props.namePrefix}-laboratory-table`;
    const laboratoryTable = this.dynamoDB.createTable(
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
        gsi: [
          {
            partitionKey: {
              name: 'LaboratoryId', // Global Secondary Index to support REST API get / update / delete requests
              type: AttributeType.STRING,
            },
          },
        ],
        lsi: baseLSIAttributes,
      },
      this.props.devEnv,
    );
    this.dynamoDBTables.set(laboratoryTableName, laboratoryTable);

    // User table
    const userTableName = `${this.props.namePrefix}-user-table`;
    const userTable = this.dynamoDB.createTable(
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
    );
    this.dynamoDBTables.set(userTableName, userTable);

    // Organization User table
    const organizationUserTableName = `${this.props.namePrefix}-organization-user-table`;
    const organizationUserTable = this.dynamoDB.createTable(
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
    );
    this.dynamoDBTables.set(organizationUserTableName, organizationUserTable);

    // Laboratory User table
    const laboratoryUserTableName = `${this.props.namePrefix}-laboratory-user-table`;
    const laboratoryUserTable = this.dynamoDB.createTable(
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
          {
            partitionKey: {
              name: 'OrganizationId', // Global Secondary Index to support lookup by OrganizationId requests
              type: AttributeType.STRING,
            },
          },
        ],
        lsi: baseLSIAttributes,
      },
      this.props.devEnv,
    );
    this.dynamoDBTables.set(laboratoryUserTableName, laboratoryUserTable);

    // Unique-Reference table
    const uniqueReferenceTableName = `${this.props.namePrefix}-unique-reference-table`;
    const uniqueReferenceTable = this.dynamoDB.createTable(
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
    );
    this.dynamoDBTables.set(uniqueReferenceTableName, uniqueReferenceTable);
  };
}
