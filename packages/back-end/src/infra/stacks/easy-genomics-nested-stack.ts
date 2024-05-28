import { NestedStack } from 'aws-cdk-lib';
import { AttributeType, Table } from 'aws-cdk-lib/aws-dynamodb';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { baseLSIAttributes, DynamoConstruct } from '../constructs/dynamodb-construct';
import { IamConstruct, IamConstructProps } from '../constructs/iam-construct';
import { LambdaConstruct } from '../constructs/lambda-construct';
import { SesConstruct } from '../constructs/ses-construct';
import { EasyGenomicsNestedStackProps } from '../types/back-end-stack';

export class EasyGenomicsNestedStack extends NestedStack {
  readonly props: EasyGenomicsNestedStackProps;
  readonly dynamoDBTables: Map<string, Table> = new Map();
  dynamoDB: DynamoConstruct;
  iam: IamConstruct;
  lambda: LambdaConstruct;
  ses: SesConstruct;

  constructor(scope: Construct, id: string, props: EasyGenomicsNestedStackProps) {
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

    this.lambda = new LambdaConstruct(this, `${this.props.constructNamespace}`, {
      ...this.props,
      iamPolicyStatements: this.iam.policyStatements, // Pass declared Easy Genomics IAM policies for attaching to respective Lambda function
      lambdaFunctionsDir: 'src/app/controllers/easy-genomics',
      lambdaFunctionsNamespace: `${this.props.constructNamespace}`,
      lambdaFunctionsResources: {
        '/easy-genomics/user/create-user-invite': {
          environment: {
            JWT_SECRET_KEY: this.props.secretKey,
          },
        },
      }, // Used for setting specific resources for a given Lambda function (e.g. environment settings, trigger events)
      environment: {
        AWS_ACCOUNT_ID: this.props.env.account!,
        COGNITO_USER_POOL_ID: this.props.userPool!.userPoolId,
        DOMAIN_NAME: this.props.applicationUrl,
        NAME_PREFIX: this.props.namePrefix,
      },
    });

    this.ses = new SesConstruct(this, `${this.props.constructNamespace}-ses`, {
      awsAccount: this.props.env.account!,
      awsRegion: this.props.env.region!,
      domainName: this.props.applicationUrl,
      emailSender: `no.reply@${this.props.applicationUrl}`,
    });
  }

  // Easy Genomics specific IAM policies
  private setupIamPolicies = () => {
    // /easy-genomics/organization/create-organization
    this.iam.addPolicyStatements(
      '/easy-genomics/organization/create-organization',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`,
          ],
          actions: ['dynamodb:PutItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/organization/read-organization
    this.iam.addPolicyStatements(
      '/easy-genomics/organization/read-organization',
      [
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`],
          actions: ['dynamodb:GetItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/organization/list-organizations
    this.iam.addPolicyStatements(
      '/easy-genomics/organization/list-organizations',
      [
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`],
          actions: ['dynamodb:Scan'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/organization/update-organization
    this.iam.addPolicyStatements(
      '/easy-genomics/organization/update-organization',
      [
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`],
          actions: ['dynamodb:GetItem', 'dynamodb:UpdateItem'],
          effect: Effect.ALLOW,
        }),
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`],
          actions: ['dynamodb:DeleteItem', 'dynamodb:PutItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/organization/delete-organization
    this.iam.addPolicyStatements(
      '/easy-genomics/organization/delete-organization',
      [
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-table`],
          actions: ['dynamodb:DeleteItem', 'dynamodb:GetItem'],
          effect: Effect.ALLOW,
        }),
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`],
          actions: ['dynamodb:DeleteItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );

    // /easy-genomics/organization/user/add-organization-user
    this.iam.addPolicyStatements(
      '/easy-genomics/organization/user/add-organization-user',
      [
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
      ],
    );
    // /easy-genomics/organization/user/edit-organization-user
    this.iam.addPolicyStatements(
      '/easy-genomics/organization/user/edit-organization-user',
      [
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
      ],
    );
    // /easy-genomics/organization/user/list-organization-users
    this.iam.addPolicyStatements(
      '/easy-genomics/organization/user/list-organization-users',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table/index/*`,
          ],
          actions: ['dynamodb:Query'],
        }),
      ],
    );
    // /easy-genomics/organization/user/list-organization-users-details
    this.iam.addPolicyStatements(
      '/easy-genomics/organization/user/list-organization-users-details',
      [
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
      ],
    );
    // /easy-genomics/organization/user/request-organization-user
    this.iam.addPolicyStatements(
      '/easy-genomics/organization/user/request-organization-user',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`,
          ],
          actions: ['dynamodb:GetItem'],
        }),
      ],
    );
    // /easy-genomics/organization/user/remove-organization-user
    this.iam.addPolicyStatements(
      '/easy-genomics/organization/user/remove-organization-user',
      [
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
      ],
    );

    // /easy-genomics/laboratory/create-laboratory
    this.iam.addPolicyStatements(
      '/easy-genomics/laboratory/create-laboratory',
      [
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
            `arn:aws:s3:::${this.props.namePrefix}-easy-genomics-lab-*`,
          ],
          actions: ['s3:CreateBucket'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/laboratory/read-laboratory
    this.iam.addPolicyStatements(
      '/easy-genomics/laboratory/read-laboratory',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
          ],
          actions: ['dynamodb:Query'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/laboratory/request-laboratory
    this.iam.addPolicyStatements(
      '/easy-genomics/laboratory/request-laboratory',
      [
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`],
          actions: ['dynamodb:GetItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/laboratory/list-laboratories
    this.iam.addPolicyStatements(
      '/easy-genomics/laboratory/list-laboratories',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
          ],
          actions: ['dynamodb:Query'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/laboratory/update-laboratory
    this.iam.addPolicyStatements(
      '/easy-genomics/laboratory/update-laboratory',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
          ],
          actions: ['dynamodb:Query', 'dynamodb:UpdateItem'],
          effect: Effect.ALLOW,
        }),
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`],
          actions: ['dynamodb:DeleteItem', 'dynamodb:PutItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/laboratory/delete-laboratory
    this.iam.addPolicyStatements(
      '/easy-genomics/laboratory/delete-laboratory',
      [
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
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`],
          actions: ['dynamodb:DeleteItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );

    // /easy-genomics/laboratory/user/add-laboratory-user
    this.iam.addPolicyStatements(
      '/easy-genomics/laboratory/user/add-laboratory-user',
      [
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`],
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
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`],
          actions: ['dynamodb:GetItem', 'dynamodb:PutItem'],
          effect: Effect.ALLOW,
        }),
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-organization-user-table`],
          actions: ['dynamodb:GetItem'],
          effect: Effect.ALLOW,
        }),
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`],
          actions: ['dynamodb:PutItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/laboratory/user/edit-laboratory-user
    this.iam.addPolicyStatements(
      '/easy-genomics/laboratory/user/edit-laboratory-user',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
          ],
          actions: ['dynamodb:Query'],
          effect: Effect.ALLOW,
        }),
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`],
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
      ],
    );
    // /easy-genomics/laboratory/user/list-laboratory-users
    this.iam.addPolicyStatements(
      '/easy-genomics/laboratory/user/list-laboratory-users',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table/index/*`,
          ],
          actions: ['dynamodb:Query'],
        }),
      ],
    );
    // /easy-genomics/laboratory/user/list-laboratory-users-details
    this.iam.addPolicyStatements(
      '/easy-genomics/laboratory/user/list-laboratory-users-details',
      [
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
      ],
    );
    // /easy-genomics/laboratory/user/remove-laboratory-user
    this.iam.addPolicyStatements(
      '/easy-genomics/laboratory/user/remove-laboratory-user',
      [
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
      ],
    );
    // /easy-genomics/laboratory/user/request-laboratory-user
    this.iam.addPolicyStatements(
      '/easy-genomics/laboratory/user/request-laboratory-user',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-user-table`,
          ],
          actions: ['dynamodb:GetItem'],
        }),
      ],
    );

    // /easy-genomics/user/create-user
    this.iam.addPolicyStatements(
      '/easy-genomics/user/create-user',
      [
        new PolicyStatement({
          resources: [
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`,
            `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-unique-reference-table`,
          ],
          actions: ['dynamodb:PutItem'],
          effect: Effect.ALLOW,
        }),
      ],
    );
    // /easy-genomics/user/list-all-users
    this.iam.addPolicyStatements(
      '/easy-genomics/user/list-all-users',
      [
        new PolicyStatement({
          resources: [`arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-user-table`],
          actions: ['dynamodb:Scan'],
          effect: Effect.ALLOW,
        }),
      ],
    );

    // /easy-genomics/user/create-user-invite
    this.iam.addPolicyStatements(
      '/easy-genomics/user/create-user-invite',
      [
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
          actions: ['cognito-idp:AdminCreateUser', 'cognito-idp:AdminDeleteUser'],
          effect: Effect.ALLOW,
        }),
        new PolicyStatement({
          resources: [
            `arn:aws:ses:${this.props.env.region!}:${this.props.env.account!}:identity/${this.props.applicationUrl}`,
            `arn:aws:ses:${this.props.env.region!}:${this.props.env.account!}:identity/*@twobulls.com`, // TODO: remove (only for Dev/Quality testing purposes)
            `arn:aws:ses:${this.props.env.region!}:${this.props.env.account!}:identity/*@deptagency.com`, // TODO: remove (only for Dev/Quality testing purposes)
            `arn:aws:ses:${this.props.env.region!}:${this.props.env.account!}:template/*`,
          ],
          actions: ['ses:SendTemplatedEmail'],
          effect: Effect.ALLOW,
          conditions: {
            StringEquals: {
              'ses:FromAddress': `no.reply@${this.props.applicationUrl}`,
            },
          },
        }),
      ],
    );

    // /easy-genomics/list-buckets
    this.iam.addPolicyStatements(
      '/easy-genomics/list-buckets',
      [
        new PolicyStatement({
          resources: [
            'arn:aws:s3:::*',
          ],
          actions: ['s3:ListAllMyBuckets'],
          effect: Effect.ALLOW,
        }),
      ],
    );
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
        gsi: [{
          partitionKey: {
            name: 'LaboratoryId', // Global Secondary Index to support REST API get / update / delete requests
            type: AttributeType.STRING,
          },
        }],
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
