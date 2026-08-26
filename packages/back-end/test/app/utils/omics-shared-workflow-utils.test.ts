import { resolveSharedWorkflowOwnerId } from '../../../src/app/utils/omics-shared-workflow-utils';

describe('resolveSharedWorkflowOwnerId', () => {
  it('returns the owner account ID of a workflow shared into this account', async () => {
    const listSharedWorkflows = jest.fn().mockResolvedValue({
      shares: [
        {
          resourceId: '1226079',
          resourceArn: 'arn:aws:omics:us-west-2:654654609030:workflow/1226079',
          ownerId: '654654609030',
        },
      ],
    });

    const ownerId = await resolveSharedWorkflowOwnerId({ listSharedWorkflows } as any, '1226079');

    expect(ownerId).toBe('654654609030');
    expect(listSharedWorkflows).toHaveBeenCalledWith(expect.objectContaining({ resourceOwner: 'OTHER' }));
  });

  it('walks pagination until it finds the matching share', async () => {
    const listSharedWorkflows = jest
      .fn()
      .mockResolvedValueOnce({
        shares: [{ resourceId: 'other-workflow', ownerId: '111111111111' }],
        nextToken: 'page-2',
      })
      .mockResolvedValueOnce({
        shares: [{ resourceId: '1226079', ownerId: '654654609030' }],
      });

    const ownerId = await resolveSharedWorkflowOwnerId({ listSharedWorkflows } as any, '1226079');

    expect(ownerId).toBe('654654609030');
    expect(listSharedWorkflows).toHaveBeenCalledTimes(2);
    expect(listSharedWorkflows).toHaveBeenNthCalledWith(2, expect.objectContaining({ nextToken: 'page-2' }));
  });

  it('returns undefined when no share matches the workflow ID', async () => {
    const listSharedWorkflows = jest.fn().mockResolvedValue({ shares: [] });

    const ownerId = await resolveSharedWorkflowOwnerId({ listSharedWorkflows } as any, '1226079');

    expect(ownerId).toBeUndefined();
  });
});
