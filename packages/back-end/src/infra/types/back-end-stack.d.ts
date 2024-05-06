import { NestedStackProps } from "aws-cdk-lib";
import { BackEndStackProps } from '@easy-genomics/shared-lib/src/infra/types/main-stack';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Table } from "aws-cdk-lib/aws-dynamodb";

// Defines the Easy Genomics specific props
export interface EasyGenomicsNestedStackProps extends BackEndStackProps, NestedStackProps {
    restApi: RestApi,
    userPool: UserPool,
    iamPolicyStatements: Map<string, PolicyStatement[]>,
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