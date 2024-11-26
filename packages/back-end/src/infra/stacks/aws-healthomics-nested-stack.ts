import { NestedStack } from 'aws-cdk-lib';
// import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Construct } from 'constructs';
import { IamConstruct, IamConstructProps } from '../constructs/iam-construct';
// import { LambdaConstruct } from '../constructs/lambda-construct';
import { AwsHealthOmicsNestedStackProps } from '../types/back-end-stack';

export class AwsHealthOmicsNestedStack extends NestedStack {
  readonly props: AwsHealthOmicsNestedStackProps;
  iam: IamConstruct;
  // lambda: LambdaConstruct;

  constructor(scope: Construct, id: string, props: AwsHealthOmicsNestedStackProps) {
    super(scope, id);
    this.props = props;

    this.iam = new IamConstruct(this, `${this.props.constructNamespace}-iam`, {
      ...(<IamConstructProps>props), // Typecast to IamConstructProps
    });
    this.setupIamPolicies();

    // this.lambda = new LambdaConstruct(this, `${this.props.constructNamespace}`, {
    //   ...this.props,
    //   iamPolicyStatements: this.iam.policyStatements, // Pass declared Auth IAM policies for attaching to respective Lambda function
    //   lambdaFunctionsDir: 'src/app/controllers/aws-healthomics',
    //   lambdaFunctionsNamespace: `${this.props.constructNamespace}`,
    //   lambdaFunctionsResources: {}, // Used for setting specific resources for a given Lambda function (e.g. environment settings, trigger events)
    //   environment: {
    //     // Defines the common environment settings for all lambda functions
    //     ACCOUNT_ID: this.props.env.account!,
    //     REGION: this.props.env.region!,
    //     DOMAIN_NAME: this.props.appDomainName,
    //     NAME_PREFIX: this.props.namePrefix,
    //   },
    // });
  }

  // AWS HealthOmics specific IAM policies
  private setupIamPolicies = () => {};
}
