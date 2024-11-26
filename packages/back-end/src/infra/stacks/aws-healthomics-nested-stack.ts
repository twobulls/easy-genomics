import { NestedStack } from 'aws-cdk-lib';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
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
  private setupIamPolicies = () => {
    /**
     * To run an Omics workflow, a service role that allows HealthOmics service to access resources is required.
     * The following policy statements provide the service role permission to:
     * - All input files locations in S3 will need Read access
     * - Any S3 output location will require read and write access
     * - CloudWatch requires access
     * - Ensure that all ECR containers and buckets required to run the workflow are in the same region
     */
    this.iam.addPolicyStatements('easy-genomics-healthomics-workflow-policy-statements', [
      new PolicyStatement({
        resources: ['arn:aws:s3:::*/*'],
        actions: ['s3:GetObject', 's3:PutObject'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: ['arn:aws:s3:::*'],
        actions: ['s3:ListBucket'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:logs:${this.props.env.region!}:${this.props.env.account!}:log-group:/aws/omics/WorkflowLog:log-stream:*`,
        ],
        actions: ['logs:CreateLogStream', 'logs:DescribeLogStreams', 'logs:PutLogEvents'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [
          `arn:aws:logs:${this.props.env.region!}:${this.props.env.account!}:log-group:/aws/omics/WorkflowLog:*`,
        ],
        actions: ['logs:CreateLogGroup'],
        effect: Effect.ALLOW,
      }),
      new PolicyStatement({
        resources: [`arn:aws:logs:${this.props.env.region!}:${this.props.env.account!}:repository/*`],
        actions: ['ecr:BatchCheckLayerAvailability', 'ecr:BatchGetImage', 'ecr:GetDownloadUrlForLayer'],
        effect: Effect.ALLOW,
      }),
    ]);
  };
}
