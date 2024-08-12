<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      id: string;
      title: string;
      timeout?: number; // milliseconds
      variant?: ToastVariant;
    }>(),
    {
      timeout: 5000,
      variant: 'info',
    },
  );

  const baseUi = {
    wrapper: 'w-full pointer-events-auto',
    container: 'relative overflow-hidden',
    inner: 'w-0 flex-1 ml-2 mr-1',
    title: 'text-body',
    description: 'text-body',
    actions: 'flex items-center gap-2 mt-3 flex-shrink-0',
    shadow: 'shadow-lg',
    rounded: 'rounded-2xl',
    padding: 'p-4',
    gap: 'gap-13',
    progress: {
      base: 'absolute bottom-0 end-0 start-0 h-1',
      background: 'bg-alert-danger-500',
    },
    transition: {
      enterActiveClass: 'transform ease-out duration-300 transition',
      enterFromClass: 'translate-y-2 opacity-0 sm:translate-y-0 sm:translate-x-2',
      enterToClass: 'translate-y-0 opacity-100 sm:translate-x-0',
      leaveActiveClass: 'transition ease-in duration-100',
      leaveFromClass: 'opacity-100',
      leaveToClass: 'opacity-0',
    },
    default: {
      color: 'primary',

      actionButton: {
        size: 'xs',
        color: 'white',
      },
    },
  };

  const variantInfoUi = {
    ...baseUi,
    background: 'bg-alert-blue-muted',
    icon: 'i-heroicons:information-circle w-6 h-6 mr-1',
    ring: 'ring-1 ring-blue-900',
  };
  const variantSuccessUi = {
    ...baseUi,
    background: 'bg-alert-success-muted',
    icon: 'i-heroicons:check-20-solid w-6 h-6 mr-1',
    ring: 'ring-1 ring-alert-success',
  };
  const variantWarningUi = {
    ...baseUi,
    background: 'bg-alert-caution-muted',
    icon: 'i-heroicons:information-circle w-6 h-6 mr-1',
    ring: 'ring-1 ring-alert-caution',
  };
  const variantErrorUi = {
    ...baseUi,
    background: 'bg-alert-danger-muted',
    icon: 'i-heroicons:exclamation-triangle w-6 h-6 mr-1',
    ring: 'ring-1 ring-alert-danger',
  };

  const variantUi = computed(() => {
    switch (props.variant) {
      case 'info':
        return variantInfoUi;
      case 'success':
        return variantSuccessUi;
      case 'warning':
        return variantWarningUi;
      case 'error':
        return variantErrorUi;
      default:
        return variantInfoUi;
    }
  });
</script>

<template>
  <UNotification :timeout="timeout" :id="id" :ui="variantUi" :title="title" :icon="variantUi.icon" />
</template>
