import { useUiStore } from '~/stores/stores';

export default function useUI() {
  function isUILoading(isMounted: boolean = true): boolean {
    const mounted = isMounted;
    const pending = useUiStore().isRequestPending;
    const loading = !mounted || pending;
    console.count('useUI; isUILoading');
    console.table({ mounted, pending, loading });
    return loading;
  }

  return { isUILoading };
}
