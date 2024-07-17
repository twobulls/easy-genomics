import useLabsStore from './labs';
import useOrgsStore from './orgs';
import useToastStore from './toast';
import useUiStore from './ui';
import useUserStore from './user';

function resetStores() {
  useLabsStore().reset();
  useOrgsStore().reset();
  useUiStore().reset();
  useUserStore().reset();
}
export { useOrgsStore, useToastStore, useUserStore, useUiStore, resetStores, useLabsStore };
