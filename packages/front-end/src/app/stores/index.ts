import useLaboratoryRunsStore from './lab-runs';
import useLabsStore from './labs';
import useOrgsStore from './orgs';
import useRunStore from './run';
import useToastStore from './toast';
import useUiStore from './ui';
import useUserStore from './user';

function resetStores() {
  useLabsStore().reset();
  useOrgsStore().reset();
  useRunStore().reset();
  useUiStore().reset();
  useUserStore().reset();
  useLaboratoryRunsStore().reset();
}
export {
  resetStores,
  useOrgsStore,
  useToastStore,
  useUserStore,
  useUiStore,
  useLabsStore,
  useRunStore,
  useLaboratoryRunsStore,
};
