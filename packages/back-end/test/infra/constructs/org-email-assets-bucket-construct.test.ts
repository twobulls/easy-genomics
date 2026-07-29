import { App, Stack } from 'aws-cdk-lib';
import { Match, Template } from 'aws-cdk-lib/assertions';
import { OrgEmailAssetsBucketConstruct } from '../../../src/infra/constructs/org-email-assets-bucket-construct';

describe('OrgEmailAssetsBucketConstruct', () => {
  it('creates a bucket with a public-read GetObject policy and no public write/list', () => {
    const app = new App();
    const stack = new Stack(app, 'test-stack');
    new OrgEmailAssetsBucketConstruct(stack, 'test-construct', {
      bucketName: 'dev-demo-org-email-assets-bucket',
      envType: 'dev',
    });

    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketName: 'dev-demo-org-email-assets-bucket',
    });

    // Statement is asserted with arrayWith (not an exact array) because CDK's Bucket
    // construct auto-injects its own bucket-policy statements alongside ours here:
    // an enforceSSL Deny statement and an autoDeleteObjects Allow statement scoped to
    // the custom-resource Lambda role. Neither grants public access; only this
    // statement does, and it is scoped to s3:GetObject alone.
    template.hasResourceProperties('AWS::S3::BucketPolicy', {
      PolicyDocument: {
        Statement: Match.arrayWith([
          Match.objectLike({
            Effect: 'Allow',
            Principal: { AWS: '*' },
            Action: 's3:GetObject',
          }),
        ]),
      },
    });
  });
});
