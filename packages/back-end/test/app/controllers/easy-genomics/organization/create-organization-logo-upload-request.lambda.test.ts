jest.mock('../../../../../src/app/services/s3-service');
jest.mock('../../../../../src/app/utils/auth-utils', () => ({
  validateOrganizationAdminAccess: jest.fn(),
  validateSystemAdminAccess: jest.fn(),
}));

import { handler } from '../../../../../src/app/controllers/easy-genomics/organization/create-organization-logo-upload-request.lambda';
import { S3Service } from '../../../../../src/app/services/s3-service';
import { validateOrganizationAdminAccess, validateSystemAdminAccess } from '../../../../../src/app/utils/auth-utils';

const s3ServiceInstance = (S3Service as jest.MockedClass<typeof S3Service>).mock.instances[0] as jest.Mocked<S3Service>;

// OrganizationId travels in the request body rather than as a path parameter: the 'create-'
// Lambda filename verb never registers a path-level {id} resource (see ALLOWED_LAMBDA_FUNCTION_OPERATIONS_WITH_RESOURCE_ID
// in verb-operations.ts, which only covers read-/update-/cancel-/patch-/delete-), so this
// mirrors the LaboratoryId-in-body pattern used by create-file-upload-request.lambda.ts.
function buildEvent(body: Record<string, unknown>, organizationId = 'org-1') {
  return {
    body: JSON.stringify({ OrganizationId: organizationId, ...body }),
    isBase64Encoded: false,
    requestContext: { authorizer: { claims: {} } },
  } as any;
}

describe('create-organization-logo-upload-request.lambda', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.ORG_EMAIL_ASSETS_BUCKET_NAME = 'dev-demo-org-email-assets-bucket';
    process.env.REGION = 'us-west-2';
    (validateSystemAdminAccess as jest.Mock).mockReturnValue(false);
    (validateOrganizationAdminAccess as jest.Mock).mockReturnValue(true);
    s3ServiceInstance.getPreSignedUploadUrl = jest.fn().mockResolvedValue('https://signed-url.example');
  });

  it('returns 403 when the caller is not an org admin', async () => {
    (validateOrganizationAdminAccess as jest.Mock).mockReturnValue(false);

    const result = await handler(buildEvent({ ContentType: 'image/png', ContentLength: 1000 }), {} as any, () => {});

    expect(result.statusCode).toBe(403);
    expect(s3ServiceInstance.getPreSignedUploadUrl).not.toHaveBeenCalled();
  });

  it('returns 400 for a disallowed content type', async () => {
    const result = await handler(buildEvent({ ContentType: 'image/gif', ContentLength: 1000 }), {} as any, () => {});

    expect(result.statusCode).toBe(400);
  });

  it('returns 400 for a file over 2MB', async () => {
    const result = await handler(
      buildEvent({ ContentType: 'image/png', ContentLength: 3 * 1024 * 1024 }),
      {} as any,
      () => {},
    );

    expect(result.statusCode).toBe(400);
  });

  it('returns a presigned URL and the public URL scoped to the org key on the happy path', async () => {
    const result = await handler(
      buildEvent({ ContentType: 'image/png', ContentLength: 1000 }, 'org-1'),
      {} as any,
      () => {},
    );

    expect(result.statusCode).toBe(200);
    const body = JSON.parse(result.body);
    expect(body.Key).toBe('org-1/logo.png');
    expect(body.Bucket).toBe('dev-demo-org-email-assets-bucket');
    expect(body.S3Url).toBe('https://signed-url.example');
    expect(body.PublicUrl).toBe('https://dev-demo-org-email-assets-bucket.s3.us-west-2.amazonaws.com/org-1/logo.png');
    expect(s3ServiceInstance.getPreSignedUploadUrl).toHaveBeenCalledWith({
      Bucket: 'dev-demo-org-email-assets-bucket',
      Key: 'org-1/logo.png',
      ContentType: 'image/png',
      ContentLength: 1000,
    });
  });
});
