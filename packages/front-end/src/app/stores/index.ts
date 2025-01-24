import useLabRunsStore from './lab-runs';
import useLabsStore from './labs';
import useOrgsStore from './orgs';
import useRunStore from './run';
import useSeqeraPipelinesStore from './seqeraPipelines';
import useToastStore from './toast';
import useUiStore from './ui';
import useUserStore from './user';

function resetStores() {
  useLabsStore().reset();
  useOrgsStore().reset();
  useRunStore().reset();
  useSeqeraPipelinesStore().reset();
  useUiStore().reset();
  useUserStore().reset();
  useLabRunsStore().reset();
}
export {
  resetStores,
  useOrgsStore,
  useToastStore,
  useUserStore,
  useUiStore,
  useLabsStore,
  useRunStore,
  useSeqeraPipelinesStore,
  useLabRunsStore,
};
