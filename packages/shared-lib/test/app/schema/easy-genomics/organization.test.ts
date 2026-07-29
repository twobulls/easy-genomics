import { OrganizationSchema, UpdateOrganizationSchema } from '../../../../src/app/schema/easy-genomics/organization';

const base = {
  OrganizationId: '11111111-1111-1111-1111-111111111111',
  Name: 'Test Org',
};

describe('OrganizationSchema email branding fields', () => {
  it('accepts a valid EmailBrandingLogoUrl and EmailBrandingFooterText', () => {
    const result = OrganizationSchema.safeParse({
      ...base,
      EmailBrandingLogoUrl: 'https://example.com/logo.png',
      EmailBrandingFooterText: 'Processed for Acme Labs.',
    });
    expect(result.success).toBe(true);
  });

  it('rejects a non-URL EmailBrandingLogoUrl', () => {
    const result = OrganizationSchema.safeParse({
      ...base,
      EmailBrandingLogoUrl: 'not-a-url',
    });
    expect(result.success).toBe(false);
  });

  it('rejects EmailBrandingFooterText over 280 characters', () => {
    const result = OrganizationSchema.safeParse({
      ...base,
      EmailBrandingFooterText: 'x'.repeat(281),
    });
    expect(result.success).toBe(false);
  });

  it('allows both branding fields to be omitted', () => {
    const result = OrganizationSchema.safeParse(base);
    expect(result.success).toBe(true);
  });

  it('UpdateOrganizationSchema also accepts the branding fields', () => {
    const result = UpdateOrganizationSchema.safeParse({
      Name: 'Test Org',
      EmailBrandingLogoUrl: 'https://example.com/logo.png',
      EmailBrandingFooterText: 'Footer',
    });
    expect(result.success).toBe(true);
  });
});
