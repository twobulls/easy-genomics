import * as path from 'path';
import { RemovalPolicy } from 'aws-cdk-lib';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket, BucketEncryption, HttpMethods, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export interface OrgEmailAssetsBucketConstructProps {
  bucketName: string;
  envType: string;
  appDomainName: string;
}

// Keys the platform-default logo/lock images are seeded under — the BucketDeployment below
// uploads each source file under its own original name, so these must match the filenames in
// front-end/src/app/public/images/email/ exactly, not an arbitrary name. SesService falls back
// to these (built from NAME_PREFIX/REGION, matching the DynamoDB table-name convention) when an
// org hasn't uploaded its own logo — see default-email-branding.ts.
export const DEFAULT_EASY_GENOMICS_LOGO_KEY = 'defaults/easy-genomics.png';
export const DEFAULT_LOCK_IMAGE_KEY = 'defaults/lock.png';

/**
 * A small public-read bucket for org-uploaded email branding logos. Distinct from the
 * per-lab data buckets (always private) because email clients need unauthenticated GET
 * access to render the logo image.
 *
 * Also hosts the platform's own default logo/lock images at a real HTTPS URL: many email
 * clients (Gmail included) strip embedded base64 data: URI images from received HTML email,
 * so the defaults must be served the same way an org's custom logo is.
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
      cors: [
        {
          allowedMethods: [HttpMethods.GET, HttpMethods.PUT, HttpMethods.HEAD],
          allowedOrigins: [`https://${props.appDomainName}`],
          allowedHeaders: ['*'],
        },
      ],
    });

    this.bucket.addToResourcePolicy(
      new PolicyStatement({
        effect: Effect.ALLOW,
        principals: [new AnyPrincipal()],
        actions: ['s3:GetObject'],
        resources: [`${this.bucket.bucketArn}/*`],
      }),
    );

    new BucketDeployment(this, 'default-assets-deployment', {
      sources: [Source.asset(path.join(__dirname, '../../../../front-end/src/app/public/images/email'))],
      destinationBucket: this.bucket,
      destinationKeyPrefix: 'defaults',
      prune: false,
    });
  }
}
