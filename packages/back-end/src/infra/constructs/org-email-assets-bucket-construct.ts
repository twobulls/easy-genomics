import { RemovalPolicy } from 'aws-cdk-lib';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket, BucketEncryption, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface OrgEmailAssetsBucketConstructProps {
  bucketName: string;
  envType: string;
}

/**
 * A small public-read bucket for org-uploaded email branding logos. Distinct from the
 * per-lab data buckets (always private) because email clients need unauthenticated GET
 * access to render the logo image — see docs/superpowers/specs/2026-07-29-org-email-branding-design.md.
 */
export class OrgEmailAssetsBucketConstruct extends Construct {
  readonly bucket: Bucket;

  constructor(scope: Construct, id: string, props: OrgEmailAssetsBucketConstructProps) {
    super(scope, id);

    this.bucket = new Bucket(this, 'bucket', {
      bucketName: props.bucketName,
      objectOwnership: ObjectOwnership.BUCKET_OWNER_ENFORCED,
      blockPublicAccess: new BlockPublicAccess({
        blockPublicAcls: true,
        blockPublicPolicy: false,
        ignorePublicAcls: true,
        restrictPublicBuckets: false,
      }),
      encryption: BucketEncryption.S3_MANAGED,
      bucketKeyEnabled: true,
      enforceSSL: true,
      autoDeleteObjects: props.envType !== 'prod',
      removalPolicy: props.envType !== 'prod' ? RemovalPolicy.DESTROY : RemovalPolicy.RETAIN,
    });

    this.bucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [new AnyPrincipal()],
        actions: ['s3:GetObject'],
        resources: [`${this.bucket.bucketArn}/*`],
      }),
    );
  }
}
