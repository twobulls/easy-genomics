import useLabsStore from './labs';
import useOrgsStore from './orgs';
import useToastStore from './toast';
import useUiStore from './ui';
import useUserStore from './user';
import useWorkflowStore from './workflow';

function resetStores() {
  useLabsStore().reset();
  useOrgsStore().reset();
  useWorkflowStore().reset();
  useUiStore().reset();
  useUserStore().reset();
}
export { resetStores, useOrgsStore, useToastStore, useUserStore, useUiStore, useLabsStore, useWorkflowStore };
