import { NestedStack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { AwsHealthOmicsNestedStackProps } from '../types/back-end-stack';

export class AwsHealthOmicsNestedStack extends NestedStack {
  constructor(scope: Construct, id: string, props: AwsHealthOmicsNestedStackProps) {
    super(scope, id, props);

    this.setupRestApiEndpoints();
  }

  // AWS HealthOmics specific REST API endpoints / Lambda Functions
  private setupRestApiEndpoints = () => {};
}
