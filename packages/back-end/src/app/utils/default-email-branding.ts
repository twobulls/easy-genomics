/**
 * Default Easy Genomics email branding assets, served from the org-email-assets S3 bucket
 * (see OrgEmailAssetsBucketConstruct) rather than a base64 data URI or a
 * `https://${domainName}/images/email/*.png` link. Data URIs are stripped by most email
 * clients (Gmail included) as an anti-phishing measure, and the domain-linked form depends on
 * the environment's front-end custom domain being wired to a reachable CloudFront
 * distribution — which isn't guaranteed (see docs/deployment/production.md Section 4). The
 * bucket's direct URL has neither problem. Bucket name and object keys must match
 * OrgEmailAssetsBucketConstruct exactly.
 */
function orgEmailAssetsBucketUrl(key: string): string {
  return `https://${process.env.NAME_PREFIX}-org-email-assets-bucket.s3.${process.env.REGION}.amazonaws.com/${key}`;
}

export const DEFAULT_EASY_GENOMICS_LOGO_DATA_URI = orgEmailAssetsBucketUrl('defaults/easy-genomics.png');

export const DEFAULT_LOCK_IMAGE_DATA_URI = orgEmailAssetsBucketUrl('defaults/lock.png');
