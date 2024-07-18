export const EGTabsStyles = {
  base: 'focus:outline-none',
  list: {
    base: 'border-b-2 rounded-none mb-4 mt-0',
    padding: 'p-0',
    height: 'h-14',
    marker: {
      wrapper: 'duration-200 ease-out focus:outline-none absolute bottom-0 h-[2px]',
      base: 'absolute bottom-0 h-[2px]',
      background: 'bg-primary',
      shadow: 'shadow-none',
    },
    tab: {
      base: 'font-serif w-auto inline-flex  justify-start ui-focus-visible:outline-0 ui-focus-visible:ring-2 ui-focus-visible:ring-primary-500 ui-not-focus-visible:outline-none focus:outline-none disabled:cursor-not-allowed disabled:opacity-75 duration-200 ease-out',
      active: 'text-primary h-14',
      inactive: 'font-serif',
      height: 'h-14',
      padding: 'p-0',
      size: 'text-lg',
    },
  },
};
