/**
 * @description Table helpers
 * @param pageFrom {Ref<number>}
 * @param pageTo {Ref<number>}
 * @param pageTotal {Ref<number>}
 */

export default function useTable(pageFrom: Ref<number>, pageTo: Ref<number>, pageTotal: Ref<number>) {
  const showingResultsMsg = computed(() => {
    if (pageTotal.value === 1) {
      return 'Showing 1 result';
    } else if (pageFrom.value === 1 && pageTo.value === pageTotal.value) {
      return `Showing ${pageTotal.value} results`;
    } else {
      return `Showing ${pageFrom.value}-${pageTo.value} of ${pageTotal.value} results`;
    }
  });

  return {
    showingResultsMsg,
  };
}
