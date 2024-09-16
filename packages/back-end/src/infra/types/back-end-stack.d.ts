import { NestedStackProps } from "aws-cdk-lib";
import { BackEndStackProps } from '@easy-genomics/shared-lib/src/infra/types/main-stack';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Table } from "aws-cdk-lib/aws-dynamodb";
import { Key } from "aws-cdk-lib/aws-kms";
import { IVpc } from "aws-cdk-lib/aws-ec2";

// Defined the Auth specific props
export interface AuthNestedStackProps extends BackEndStackProps, NestedStackProps {
    cognitoIdpKmsKey?: Key,
}

// Defines the Easy Genomics specific props
export interface EasyGenomicsNestedStackProps extends BackEndStackProps, NestedStackProps {
    restApi?: RestApi,
    userPool?: UserPool,
    userPoolClient?: UserPoolClient,
    iamPolicyStatements?: Map<string, PolicyStatement[]>,
    cognitoIdpKmsKey?: Key,
    vpc?: IVpc,
}

// Defines the AWS HealthOmics specific props
export interface AwsHealthOmicsNestedStackProps extends EasyGenomicsNestedStackProps {
}

// Defines the NextFlow Tower specific props
export interface NFTowerNestedStackProps extends EasyGenomicsNestedStackProps {
}

// Defines the Data Provisioning specific props
export interface DataProvisioningNestedStackProps extends BackEndStackProps, NestedStackProps {
    userPool: UserPool,
    userPoolSystemAdminGroupName?: string,
    dynamoDBTables: Map<string, Table>
}