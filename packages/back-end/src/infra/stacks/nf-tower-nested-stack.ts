import { NestedStack } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NFTowerNestedStackProps } from '../types/back-end-stack';

export class NFTowerNestedStack extends NestedStack {
  constructor(scope: Construct, id: string, props: NFTowerNestedStackProps) {
    super(scope, id, props);

    this.setupRestApiEndpoints();
  }

  // AWS HealthOmics specific REST API endpoints / Lambda Functions
  private setupRestApiEndpoints = () => {};
}
