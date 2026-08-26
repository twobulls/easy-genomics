import { ListSharesCommandInput } from '@aws-sdk/client-omics';
import { OmicsService } from '@BE/services/omics-service';
import { workflowIdFromOmicsShare } from '@BE/utils/laboratory-workflow-access-utils';

/**
 * AWS HealthOmics resolves a bare workflow `id` only within the caller's own account: GetWorkflow,
 * ListWorkflowVersions, and StartRun all return ResourceNotFoundException for a workflow owned by
 * another account, even when IAM authorizes the call, unless the request explicitly includes that
 * account's ID as `workflowOwnerId`. There's no way to know the owner ID up front (Easy Genomics
 * doesn't track it), so it's looked up via ListShares(resourceOwner: 'OTHER') and matched by
 * workflow ID.
 */
export async function resolveSharedWorkflowOwnerId(
  omicsService: Pick<OmicsService, 'listSharedWorkflows'>,
  workflowId: string,
): Promise<string | undefined> {
  let nextToken: string | undefined;
  do {
    const page = await omicsService.listSharedWorkflows(<ListSharesCommandInput>{
      resourceOwner: 'OTHER',
      maxResults: 100,
      nextToken,
    });
    for (const share of page.shares ?? []) {
      if (workflowIdFromOmicsShare(share) === workflowId) {
        return share.ownerId;
      }
    }
    nextToken = page.nextToken;
  } while (nextToken);
  return undefined;
}
