import { useUiStore } from '~/stores/stores';

export default function useUI() {
  function isUILoading(isMounted: boolean = true): boolean {
    return !isMounted || useUiStore().isRequestPending;
  }

  return { isUILoading };
}
