process.env.NAME_PREFIX = 'unit-test';
process.env.REGION = 'us-west-2';

import {
  DEFAULT_EASY_GENOMICS_LOGO_DATA_URI,
  DEFAULT_LOCK_IMAGE_DATA_URI,
} from '../../../src/app/utils/default-email-branding';
import {
  DEFAULT_EASY_GENOMICS_LOGO_KEY,
  DEFAULT_LOCK_IMAGE_KEY,
} from '../../../src/infra/constructs/org-email-assets-bucket-construct';

describe('default-email-branding', () => {
  it('builds the default logo URL from NAME_PREFIX/REGION and the construct-defined key', () => {
    expect(DEFAULT_EASY_GENOMICS_LOGO_DATA_URI).toBe(
      `https://unit-test-org-email-assets-bucket.s3.us-west-2.amazonaws.com/${DEFAULT_EASY_GENOMICS_LOGO_KEY}`,
    );
  });

  it('builds the default lock image URL from NAME_PREFIX/REGION and the construct-defined key', () => {
    expect(DEFAULT_LOCK_IMAGE_DATA_URI).toBe(
      `https://unit-test-org-email-assets-bucket.s3.us-west-2.amazonaws.com/${DEFAULT_LOCK_IMAGE_KEY}`,
    );
  });

  it('stays in sync with the S3 keys the org-email-assets bucket construct seeds', () => {
    // Guards against the two files drifting apart: default-email-branding.ts hardcodes these
    // keys rather than importing them (to avoid a src -> infra dependency), so this test fails
    // loudly instead of the image URLs silently breaking if one file changes without the other.
    expect(DEFAULT_EASY_GENOMICS_LOGO_DATA_URI.endsWith(`/${DEFAULT_EASY_GENOMICS_LOGO_KEY}`)).toBe(true);
    expect(DEFAULT_LOCK_IMAGE_DATA_URI.endsWith(`/${DEFAULT_LOCK_IMAGE_KEY}`)).toBe(true);
  });
});
