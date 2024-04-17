import * as fs from 'fs';
import path from 'path';
import { S3Construct } from '@easy-genomics/shared-lib/src/infra/constructs/s3-construct';
import { MainStackProps } from '@easy-genomics/shared-lib/src/infra/types/main-stack';
import { CfnOutput, Duration } from 'aws-cdk-lib';
import { Certificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  HeadersFrameOption,
  HeadersReferrerPolicy,
  OriginAccessIdentity,
  ResponseHeadersPolicy,
  ResponseSecurityHeadersBehavior,
  SecurityPolicyProtocol,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { CanonicalUserPrincipal, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { ARecord, HostedZone, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Bucket, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';

export type SecurityHeaders = ResponseSecurityHeadersBehavior & {
  /**
   * Whether or not to apply security headers.
   *
   * Defaults to true.
   */
  enabled?: boolean;
};

/**
 * Default Security Headers for Static Web App Hosting.
 *
 * NOTES:
 * 1. Content Security Policy should be manually configured and applied. They can be hard to get right but are the most effective frontend security control. Add your own and merge with this config!
 * 2. The XSS Protections is not configured due to low support and CSP being a better protection.
 */
export const DefaultSecurityHeaders: SecurityHeaders = {
  enabled: true,
  frameOptions: {
    frameOption: HeadersFrameOption.DENY,
    override: false,
  },
  strictTransportSecurity: {
    accessControlMaxAge: Duration.days(365),
    override: false,
  },
  contentTypeOptions: {
    override: false,
  },
  referrerPolicy: {
    referrerPolicy: HeadersReferrerPolicy.NO_REFERRER,
    override: false,
  },
};

export interface WwwHostingConstructProps extends MainStackProps {
  description: string;
  indexCacheDuration?: Duration;
  securityHeaders?: SecurityHeaders;
  webAclId?: string;
  webSiteIndexDocument?: string;
}

/**
 * This WWW Hosting Construct to provision the resources for a static website.
 */
export class WwwHostingConstruct extends Construct {
  readonly props: WwwHostingConstructProps;
  readonly s3Buckets: Map<string, Bucket> = new Map();

  constructor(scope: Construct, id: string, props: WwwHostingConstructProps) {
    super(scope, id);
    this.props = {
      indexCacheDuration: Duration.minutes(5),
      securityHeaders: DefaultSecurityHeaders,
      webSiteIndexDocument: 'index.html',
      ...props,
    };

    // WWW S3 Bucket
    this.setupS3Buckets();

    // CloudFront Distribution
    this.setupCloudFrontDistribution();
  }

  // WWW S3 Bucket for static web pages
  private setupS3Buckets = () => {
    const applicationUri: string = this.props.siteDistribution.applicationUri;
    const s3: S3Construct = new S3Construct(this, `${this.props.constructNamespace}-s3`, {});

    // Using the configured domainName for the WWW S3 Bucket
    const wwwBucketName: string = applicationUri; // Must be globally unique
    new CfnOutput(this, 'SiteApplicationUrl', { key: 'SiteApplicationUrl', value: `https://${applicationUri}` });

    const wwwBucket: Bucket = s3.createBucket(
      wwwBucketName,
      {
        accessControl: BucketAccessControl.PRIVATE,
      },
      this.props.devEnv,
    );
    this.s3Buckets.set(wwwBucketName, wwwBucket); // Add Bucket to Map collection
  };

  // CloudFront Distribution - requires the HostedZone and Certificate are already configured in AWS
  private setupCloudFrontDistribution = () => {
    const applicationUri: string = this.props.siteDistribution.applicationUri;

    const wwwBucket: Bucket | undefined = this.s3Buckets.get(applicationUri);
    if (!wwwBucket) {
      throw new Error(`S3 Bucket not found: ${applicationUri}`);
    }

    // Grant CloudFront access to WWW S3 Bucket
    const originAccessIdentity: OriginAccessIdentity = new OriginAccessIdentity(this, 'cloudfront-OAI', {
      comment: `OAI for ${applicationUri}`,
    });

    wwwBucket.grantRead(originAccessIdentity);

    wwwBucket.addToResourcePolicy(
      new PolicyStatement({
        actions: ['s3:GetObject'],
        resources: [wwwBucket.arnForObjects('*')],
        principals: [
          new CanonicalUserPrincipal(originAccessIdentity.cloudFrontOriginAccessIdentityS3CanonicalUserId),
        ],
      }),
    );
    new CfnOutput(this, 'HostingBucketName', { key: 'HostingBucketName', value: wwwBucket.bucketName });

    const responseHeadersPolicy: ResponseHeadersPolicy | undefined = this.applySecurityHeaders();

    const indexCachePolicy = new CachePolicy(this, 'IndexCachePolicy', {
      maxTtl: this.props.indexCacheDuration,
      minTtl: this.props.indexCacheDuration,
      defaultTtl: this.props.indexCacheDuration,
      comment: `Caching policy for ${applicationUri}`,
      enableAcceptEncodingGzip: true,
      enableAcceptEncodingBrotli: true,
    });

    // Retrieve Hosted Zone
    const hostedZone: IHostedZone = HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      hostedZoneId: this.props.siteDistribution.hostedZoneId,
      zoneName: this.props.siteDistribution.hostedZoneName,
    });
    new CfnOutput(this, 'HostedZoneId', { key: 'HostedZoneId', value: hostedZone.hostedZoneId });
    new CfnOutput(this, 'HostedZoneName', { key: 'HostedZoneName', value: hostedZone.zoneName });

    // Retrieve TLS certificate
    const certificate: ICertificate = Certificate.fromCertificateArn(
      this,
      'SiteCertificate',
      this.props.siteDistribution.certificateArn,
    );
    new CfnOutput(this, 'CertificateArn', { key: 'CertificateArn', value: certificate.certificateArn });

    const s3Origin: S3Origin = new S3Origin(wwwBucket, { originAccessIdentity: originAccessIdentity });
    const indexPath: string = `/${this.props.webSiteIndexDocument}`;

    // CloudFront distribution
    const distribution: Distribution = new Distribution(this, 'SiteDistribution', {
      certificate: certificate,
      defaultRootObject: this.props.webSiteIndexDocument,
      domainNames: [applicationUri],
      minimumProtocolVersion: SecurityPolicyProtocol.TLS_V1_2_2021,
      webAclId: this.props.webAclId, // Optional AWS WAF web ACL
      defaultBehavior: {
        origin: s3Origin,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        compress: true,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD_OPTIONS, // HEAD, GET, OPTIONS
        viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY,
        responseHeadersPolicy: responseHeadersPolicy,
      },
      additionalBehaviors: {
        [indexPath]: {
          origin: s3Origin,
          cachePolicy: indexCachePolicy,
          responseHeadersPolicy: responseHeadersPolicy,
        },
      },
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: this.props.indexCacheDuration,
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: this.props.indexCacheDuration,
        },
      ],
    });
    new CfnOutput(this, 'DistributionId', { key: 'DistributionId', value: distribution.distributionId });

    // Route53 alias record for the CloudFront distribution
    new ARecord(this, 'SiteAliasRecord', {
      target: RecordTarget.fromAlias(new CloudFrontTarget(distribution)),
      zone: hostedZone,
    });

    const wwwSourceDir = path.join(__dirname, '../../../dist'); // Generated site contents folder
    if (fs.existsSync(wwwSourceDir)) {
      // Deploy site contents to S3 bucket
      new BucketDeployment(this, 'DeployWithInvalidation', {
        sources: [Source.asset(wwwSourceDir)],
        destinationBucket: wwwBucket,
        distribution,
        distributionPaths: ['/*'],
      });
    }
  };

  private applySecurityHeaders = (): ResponseHeadersPolicy | undefined => {
    if (this.props.securityHeaders?.enabled) {
      return new ResponseHeadersPolicy(this, 'ResponseHeadersPolicy', {
        securityHeadersBehavior: this.props.securityHeaders,
      });
    } else {return;}
  };
}
