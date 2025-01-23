import { RemovalPolicy, StackProps } from 'aws-cdk-lib';
import {
  BlockPublicAccess,
  Bucket,
  BucketEncryption,
  BucketProps,
  HttpMethods,
  ObjectOwnership,
} from 'aws-cdk-lib/aws-s3';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Construct } from 'constructs';

export interface S3ConstructProps extends StackProps {
  envType: string;
}

/**
 * This S3 Construct to provision S3 buckets.
 */
export class S3Construct extends Construct {
  readonly props: S3ConstructProps;

  constructor(scope: Construct, id: string, props: S3ConstructProps) {
    super(scope, id);
    this.props = props;
  }

  public createBucket = (envBucketName: string, customBucketProps: BucketProps): Bucket => {
    const autoDeleteObjects = this.props.envType !== 'prod' ? true : false; // Only for Non-Prod
    const removalPolicy = this.props.envType !== 'prod' ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN; // Only for Non-Prod

    const defaultBucketProps: BucketProps = {
      bucketName: envBucketName,
      encryption: BucketEncryption.S3_MANAGED,
      enforceSSL: true,
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
      publicReadAccess: false,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      autoDeleteObjects: autoDeleteObjects,
      removalPolicy: removalPolicy,
      cors: [
        {
          allowedMethods: [HttpMethods.GET],
          allowedOrigins: ['*'], // TODO: Restrict to domain in configuration file
          allowedHeaders: ['*'],
        },
      ],
    };

    const bucketProps: BucketProps = {
      ...defaultBucketProps,
      ...customBucketProps, // Override default props with supplied custom props
    };

    return new Bucket(this, envBucketName, bucketProps);
  };
}
