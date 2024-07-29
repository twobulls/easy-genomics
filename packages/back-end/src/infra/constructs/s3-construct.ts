import { Duration, RemovalPolicy } from 'aws-cdk-lib';
import { BlockPublicAccess, Bucket, BucketEncryption, HttpMethods, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface S3ConstructProps {}

export class S3Construct extends Construct {
  readonly props: S3ConstructProps;

  constructor(scope: Construct, id: string, props: S3ConstructProps) {
    super(scope, id);
    this.props = props;
  }

  public createBucket = (envBucketName: string, devEnv?: boolean): Bucket => {
    const removalPolicy = devEnv ? RemovalPolicy.DESTROY : undefined; // Only for Local, Sandbox, Dev

    const bucket = new Bucket(this, envBucketName, {
      bucketName: envBucketName,
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.S3_MANAGED,
      autoDeleteObjects: true,
      removalPolicy: removalPolicy,
      lifecycleRules: [
        {
          prefix: 'uploads',
          abortIncompleteMultipartUploadAfter: Duration.days(2),
          enabled: true,
        },
      ],
      cors: [
        {
          allowedMethods: [HttpMethods.GET, HttpMethods.POST, HttpMethods.PUT],
          allowedOrigins: ['*'], // TODO: Restrict to domain in configuration file
          allowedHeaders: ['*'],
        },
      ],
    });
    return bucket;
  };
}
