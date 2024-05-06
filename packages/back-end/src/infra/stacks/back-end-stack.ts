import { BackEndStackProps } from '@easy-genomics/shared-lib/src/infra/types/main-stack';
import { Stack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AwsHealthOmicsNestedStack } from './aws-healthomics-nested-stack';
import { DataProvisioningNestedStack } from './data-provisioning-nested-stack';
import { EasyGenomicsNestedStack } from './easy-genomics-nested-stack';
import { NFTowerNestedStack } from './nf-tower-nested-stack';
import { ApiGatewayConstruct } from '../constructs/api-gateway-construct';
import { CognitoIdpConstruct } from '../constructs/cognito-idp-construct';
import { IamConstruct } from '../constructs/iam-construct';
import { LambdaConstruct } from '../constructs/lambda-construct';
import {
  AwsHealthOmicsNestedStackProps,
  EasyGenomicsNestedStackProps,
  NFTowerNestedStackProps, DataProvisioningNestedStackProps,
} from '../types/back-end-stack';

/**
 * This Back-End Stack defines the core AWS infrastructure required for the web application including:
 *  - Cognito User Pool & Client
 *  - API Gateway
 *  - IAM Policy Statements, Roles, etc..
 *
 * It then will provision the specific Easy Genomics, AWS HealthOmics, and NextFlow Tower Nested Stacks.
 */
export class BackEndStack extends Stack {
  readonly props: BackEndStackProps;
  protected authLambdas!: LambdaConstruct;
  protected apiGateway!: ApiGatewayConstruct;
  protected cognitoIdp!: CognitoIdpConstruct;
  protected iam!: IamConstruct;

  constructor(scope: Construct, id: string, props: BackEndStackProps) {
    super(scope, id, props);
    this.props = props;

    // Auth Lambda Functions
    this.authLambdas = this.setupAuthLambdaFunctions();
    // Cognito User Pool / Groups for all users
    this.cognitoIdp = this.setupCognitoIdp();
    // API Gateway for REST APIs
    this.apiGateway = this.setupApiGateway();
    // IAM Policies
    this.iam = this.setupIam();

    // Initiate Nested Stacks for Easy Genomics, AWS HealthOmics, Nextflow Tower
    this.initiateNestedStacks();
  }

  private setupAuthLambdaFunctions = (): LambdaConstruct => {
    return new LambdaConstruct(this, `${this.props.constructNamespace}-auth`, {
      ...this.props,
      lambdaFunctionsDir: 'src/app/controllers/auth',
      lambdaFunctionsNamespace: `${this.props.constructNamespace}-auth`,
      lambdaFunctionsResources: {}, // Used for setting specific resources for a given Lambda function (e.g. environment settings, trigger events)
      environment: {
        AWS_ACCOUNT_ID: this.props.env.account!,
        NAME_PREFIX: this.props.namePrefix,
      },
    });
  };

  // Returns CognitoIdp Construct for easier access to associated objects (UserPool, UserPoolClient)
  private setupCognitoIdp = (): CognitoIdpConstruct => {
    return new CognitoIdpConstruct(this, `${this.props.constructNamespace}-cognito-idp`, {
      constructNamespace: this.props.constructNamespace,
      devEnv: this.props.devEnv,
      authLambdaFunctions: this.authLambdas.lambdaFunctions,
    });
  };

  // Returns API Gateway Construct for easier access to associated objects (RestApi)
  private setupApiGateway = (): ApiGatewayConstruct => {
    return new ApiGatewayConstruct(this, `${this.props.constructNamespace}-apigw`, {
      description: 'Easy Genomics API Gateway',
    });
  };

  // Returns IAM Construct for easier access to associated objects (IAM Statements)
  private setupIam = (): IamConstruct => {
    return new IamConstruct(this, `${this.props.constructNamespace}-iam`, {
      ...this.props,
      awsCognitoUserPoolArn: this.cognitoIdp.userPool.userPoolArn,
    });
  };

  private initiateNestedStacks = () => {
    // EasyGenomicsNestedStackProps extends the BackEndStackProps
    const easyGenomicsNestedStackProps: EasyGenomicsNestedStackProps = {
      ...this.props,
      constructNamespace: `${this.props.namePrefix}-easy-genomics`, // Overriding value
      restApi: this.apiGateway.restApi, // Use the same REST API provided from this stack.
      userPool: this.cognitoIdp.userPool,
      iamPolicyStatements: this.iam.policyStatements,
    };
    const easyGenomicsNestedStack = new EasyGenomicsNestedStack(this, 'easy-genomics-nested-stack', easyGenomicsNestedStackProps);

    // AwsHealthOmicsNestedStackProps extends the EasyGenomicsNestedStackProps
    const awsHealthOmicsNestedStackProps: AwsHealthOmicsNestedStackProps = {
      ...easyGenomicsNestedStackProps,
      constructNamespace: `${this.props.namePrefix}-aws-healthomics`, // Overriding value
      // Use the same REST API provided from this stack - but this can be replaced later with a separate REST API specific for AWS HealthOmics.
      restApi: this.apiGateway.restApi,
    };
    new AwsHealthOmicsNestedStack(
      this, 'aws-healthomics-nested-stack', awsHealthOmicsNestedStackProps,
    );

    // NFTowerNestedStackProps extends the EasyGenomicsNestedStackProps
    const nfTowerNestedStackProps: NFTowerNestedStackProps = {
      ...easyGenomicsNestedStackProps,
      constructNamespace: `${this.props.namePrefix}-nf-tower`, // Overriding value
      // Use the same REST API provided from this stack - but this can be replaced later with a separate REST API specific for NF Tower.
      restApi: this.apiGateway.restApi,
    };
    new NFTowerNestedStack(this, 'nf-tower-nested-stack', nfTowerNestedStackProps);

    // DataProvisioningNestedStackProps extends the BackEndStackProps
    const dataProvisioningNestedStackProps: DataProvisioningNestedStackProps = {
      ...this.props,
      userPool: this.cognitoIdp.userPool,
      userPoolSystemAdminGroupName: this.cognitoIdp.userPoolGroup.groupName,
      dynamoDBTables: easyGenomicsNestedStack.dynamoDBTables,
    };
    new DataProvisioningNestedStack(this, 'data-provisioning-nested-stack', dataProvisioningNestedStackProps);
  };
}
