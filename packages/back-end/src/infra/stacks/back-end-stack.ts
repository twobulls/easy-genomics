import { BackEndStackProps } from '@easy-genomics/shared-lib/src/infra/types/main-stack';
import { CfnOutput, RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Key, KeySpec } from 'aws-cdk-lib/aws-kms';
import { Construct } from 'constructs';
import { AuthNestedStack } from './auth-nested-stack';
import { AwsHealthOmicsNestedStack } from './aws-healthomics-nested-stack';
import { DataProvisioningNestedStack } from './data-provisioning-nested-stack';
import { EasyGenomicsNestedStack } from './easy-genomics-nested-stack';
import { NFTowerNestedStack } from './nf-tower-nested-stack';
import { ApiGatewayConstruct } from '../constructs/api-gateway-construct';
import {
  AuthNestedStackProps,
  AwsHealthOmicsNestedStackProps,
  DataProvisioningNestedStackProps,
  EasyGenomicsNestedStackProps,
  NFTowerNestedStackProps,
} from '../types/back-end-stack';

/**
 * This Back-End Stack serves as an orchestrator to provision required AWS
 * infrastructure and shares the resource references to satisfy the dependencies
 * of other AWS infrastructure.
 *
 * It will provision an API Gateway REST API instance which is then supplied to
 * will the Nested Stacks:
 *  - Auth
 *  - Easy Genomics
 *  - AWS HealthOmics
 *  - NF Tower
 *
 * Each Nested Stack is responsible for declaring its required IAM policies,
 * Lambda Functions, DynamoDB tables, etc. in order to make easier to maintain
 * and extend.
 */
export class BackEndStack extends Stack {
  readonly kmsKeys: Map<string, Key> = new Map();
  readonly props: BackEndStackProps;
  protected apiGateway!: ApiGatewayConstruct;

  constructor(scope: Construct, id: string, props: BackEndStackProps) {
    super(scope, id, props);
    this.props = props;

    // Create KMS symmetric encryption key for Cognito to generate secrets - temporary passwords, verification codes, confirmation codes
    this.kmsKeys.set('cognito-idp-kms-key',
      new Key(this, `${this.props.constructNamespace}-cognito-idp-kms-key`, {
        alias: `${this.props.constructNamespace}-cognito-idp-kms-key`,
        keySpec: KeySpec.SYMMETRIC_DEFAULT,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
    );

    // Create KMS symmetric encryption key to protect sensitive Easy Genomics DynamoDB data
    this.kmsKeys.set('dynamo-db-kms-key',
      new Key(this, `${this.props.constructNamespace}-dynamo-db-kms-key`, {
        alias: `${this.props.constructNamespace}-dynamo-db-kms-key`,
        keySpec: KeySpec.SYMMETRIC_DEFAULT,
        removalPolicy: RemovalPolicy.DESTROY,
      }),
    );

    // API Gateway for REST APIs
    this.apiGateway = new ApiGatewayConstruct(this, `${this.props.constructNamespace}-apigw`, {
      description: 'Easy Genomics API Gateway',
    });

    // Initiate Nested Stacks for Auth, Easy Genomics, AWS HealthOmics, Nextflow Tower
    this.initiateNestedStacks();
  }

  private initiateNestedStacks = () => {
    const authNestedStackProps: AuthNestedStackProps = {
      ...this.props,
      constructNamespace: `${this.props.constructNamespace}-auth`, // Overriding value
      cognitoIdpKmsKey: this.kmsKeys.get('cognito-idp-kms-key'),
    };
    const authNestedStack = new AuthNestedStack(this, `${this.props.envName}-auth-nested-stack`, authNestedStackProps);

    const easyGenomicsNestedStackProps: EasyGenomicsNestedStackProps = {
      ...this.props,
      constructNamespace: `${this.props.namePrefix}-easy-genomics`, // Overriding value
      restApi: this.apiGateway.restApi,
      userPool: authNestedStack.cognito.userPool,
      userPoolClient: authNestedStack.cognito.userPoolClient,
      cognitoIdpKmsKey: this.kmsKeys.get('cognito-idp-kms-key'),
      dynamoDbKmsKey: this.kmsKeys.get('dynamo-db-kms-key'),
    };
    const easyGenomicsNestedStack = new EasyGenomicsNestedStack(this, `${this.props.envName}-easy-genomics-nested-stack`, easyGenomicsNestedStackProps);

    const awsHealthOmicsNestedStackProps: AwsHealthOmicsNestedStackProps = {
      ...easyGenomicsNestedStackProps,
      constructNamespace: `${this.props.namePrefix}-aws-healthomics`, // Overriding value
      restApi: this.apiGateway.restApi,
    };
    new AwsHealthOmicsNestedStack(
      this, `${this.props.envName}-aws-healthomics-nested-stack`, awsHealthOmicsNestedStackProps,
    );

    const nfTowerNestedStackProps: NFTowerNestedStackProps = {
      ...easyGenomicsNestedStackProps,
      constructNamespace: `${this.props.namePrefix}-nf-tower`, // Overriding value
      restApi: this.apiGateway.restApi,
    };
    new NFTowerNestedStack(this, `${this.props.envName}-nf-tower-nested-stack`, nfTowerNestedStackProps);

    const dataProvisioningNestedStackProps: DataProvisioningNestedStackProps = {
      ...this.props,
      constructNamespace: `${this.props.namePrefix}-data-provisioning`, // Overriding value
      userPool: authNestedStack.cognito.userPool,
      userPoolSystemAdminGroupName: authNestedStack.cognito.userPoolGroup.groupName,
      dynamoDBTables: easyGenomicsNestedStack.dynamoDBTables,
    };
    new DataProvisioningNestedStack(this, 'data-provisioning-nested-stack', dataProvisioningNestedStackProps);

    new CfnOutput(this, 'CognitoUserPoolId', { key: 'CognitoUserPoolId', value: authNestedStack.cognito.userPool.userPoolId });
    new CfnOutput(this, 'CognitoUserPoolClientId', { key: 'CognitoUserPoolClientId', value: authNestedStack.cognito.userPoolClient.userPoolClientId });
    new CfnOutput(this, 'ApiGatewayRestApiUrl', { key: 'ApiGatewayRestApiUrl', value: this.apiGateway.restApi.url });
  };
}
