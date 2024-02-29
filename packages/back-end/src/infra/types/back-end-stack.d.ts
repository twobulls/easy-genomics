import { NestedStackProps } from "aws-cdk-lib";
import { MainStackProps } from '@easy-genomics/shared-lib/src/app/types/main-stack';
import { RestApi } from 'aws-cdk-lib/aws-apigateway';
import { UserPool } from 'aws-cdk-lib/aws-cognito';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';

// Defines the Easy Genomics specific props
export interface EasyGenomicsNestedStackProps extends MainStackProps, NestedStackProps {
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
