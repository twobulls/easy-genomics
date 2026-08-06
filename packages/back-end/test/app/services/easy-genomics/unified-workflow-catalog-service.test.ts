import type { WorkflowListItem } from '@aws-sdk/client-omics';
import { LaboratoryService } from '../../../../src/app/services/easy-genomics/laboratory-service';
import { buildUnifiedWorkflowCatalogForOrganization } from '../../../../src/app/services/easy-genomics/unified-workflow-catalog-service';
import { OmicsService } from '../../../../src/app/services/omics-service';
import { listAllSharedWorkflowSummaries } from '../../../../src/app/utils/omics-shared-workflow-utils';

jest.mock('../../../../src/app/services/easy-genomics/laboratory-service');
jest.mock('../../../../src/app/services/omics-service');
jest.mock('../../../../src/app/services/ssm-service');
jest.mock('../../../../src/app/utils/omics-shared-workflow-utils', () => ({
  listAllSharedWorkflowSummaries: jest.fn(),
}));
jest.mock('../../../../src/app/utils/rest-api-utils', () => ({
  getNextFlowApiQueryParameters: jest.fn(),
  httpRequest: jest.fn(),
  REST_API_METHOD: { GET: 'GET' },
}));

describe('buildUnifiedWorkflowCatalogForOrganization', () => {
  const ORG_ID = 'org-001';
  const LAB_ID = 'lab-001';

  beforeEach(() => {
    jest.clearAllMocks();

    (LaboratoryService as jest.MockedClass<typeof LaboratoryService>).prototype.queryByOrganizationId = jest
      .fn()
      .mockResolvedValue([
        {
          OrganizationId: ORG_ID,
          LaboratoryId: LAB_ID,
          AwsHealthOmicsEnabled: true,
          NextFlowTowerEnabled: false,
        },
      ]);

    (OmicsService as jest.MockedClass<typeof OmicsService>).prototype.listWorkflows = jest.fn();
  });

  it('tags private and shared entries and de-duplicates colliding ids', async () => {
    const privateItems: WorkflowListItem[] = [
      { id: 'wf-private', name: 'Private Only' },
      { id: 'wf-both', name: 'Also Shared' },
    ];

    (OmicsService as jest.MockedClass<typeof OmicsService>).prototype.listWorkflows = jest
      .fn()
      .mockResolvedValue({ items: privateItems, nextToken: undefined });

    (listAllSharedWorkflowSummaries as jest.Mock).mockResolvedValue([
      { id: 'wf-shared', name: 'Shared Only', ownerAccountId: '111122223333' },
      { id: 'wf-both', name: 'Shared Dup', ownerAccountId: '444455556666' },
    ]);

    const catalog = await buildUnifiedWorkflowCatalogForOrganization(ORG_ID);

    const byId = Object.fromEntries(catalog.map((e) => [e.workflowId, e]));

    expect(byId['wf-private']).toMatchObject({
      platform: 'HealthOmics',
      source: 'PRIVATE',
    });
    expect(byId['wf-private'].ownerAccountId).toBeUndefined();

    expect(byId['wf-shared']).toMatchObject({
      platform: 'HealthOmics',
      source: 'SHARED',
      ownerAccountId: '111122223333',
      name: 'Shared Only',
    });

    // Private wins when the same id appears in both lists (seenKeys de-dup).
    expect(byId['wf-both']).toMatchObject({
      platform: 'HealthOmics',
      source: 'PRIVATE',
      name: 'Also Shared',
    });
    expect(byId['wf-both'].ownerAccountId).toBeUndefined();

    expect(catalog.filter((e) => e.workflowId === 'wf-both')).toHaveLength(1);
  });
});
