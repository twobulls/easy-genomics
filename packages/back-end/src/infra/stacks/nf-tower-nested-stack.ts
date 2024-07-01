import { NestedStack } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { IamConstruct, IamConstructProps } from '../constructs/iam-construct';
import { LambdaConstruct } from '../constructs/lambda-construct';
import { NFTowerNestedStackProps } from '../types/back-end-stack';

export class NFTowerNestedStack extends NestedStack {
  props: NFTowerNestedStackProps;
  iam: IamConstruct;
  lambda: LambdaConstruct;

  constructor(scope: Construct, id: string, props: NFTowerNestedStackProps) {
    super(scope, id, props);
    this.props = props;

    this.iam = new IamConstruct(this, `${this.props.constructNamespace}-iam`, {
      ...(<IamConstructProps>props), // Typecast to IamConstructProps
    });
    this.setupIamPolicies();

    this.lambda = new LambdaConstruct(this, `${this.props.constructNamespace}`, {
      ...this.props,
      iamPolicyStatements: this.iam.policyStatements, // Pass declared Auth IAM policies for attaching to respective Lambda function
      lambdaFunctionsDir: 'src/app/controllers/nf-tower',
      lambdaFunctionsNamespace: `${this.props.constructNamespace}`,
      lambdaFunctionsResources: {
        '/nf-tower/read-workflows': {
          environment: {
            DYNAMODB_KMS_KEY_ID: this.props.dynamoDbKmsKey?.keyId!,
            DYNAMODB_KMS_KEY_ARN: this.props.dynamoDbKmsKey?.keyArn!,
          },
        },
      }, // Used for setting specific resources for a given Lambda function (e.g. environment settings, trigger events)
      environment: {
        // Defines the common environment settings for all lambda functions
        ACCOUNT_ID: this.props.env.account!,
        REGION: this.props.env.region!,
        DOMAIN_NAME: this.props.applicationUrl,
        ENV_TYPE: this.props.envType,
        NAME_PREFIX: this.props.namePrefix,
        SEQERA_API_BASE_URL: this.props.seqeraApiBaseUrl,
      },
    });
  }

  // NF-Tower specific IAM policies
  private setupIamPolicies = () => {
    // /nf-tower/read-workflows
    this.iam.addPolicyStatements('/nf-tower/read-workflows', [
      new PolicyStatement({
        resources: [
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table`,
          `arn:aws:dynamodb:${this.props.env.region!}:${this.props.env.account!}:table/${this.props.namePrefix}-laboratory-table/index/*`,
        ],
        actions: ['dynamodb:Query'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [this.props.dynamoDbKmsKey?.keyArn!],
        actions: ['kms:GenerateDataKey', 'kms:Decrypt'],
        effect: Effect.ALLOW,
      }),
    ]);
  };
}
