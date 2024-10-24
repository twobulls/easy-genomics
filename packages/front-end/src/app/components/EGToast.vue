<script setup lang="ts">
  import { ToastVariant } from '@FE/types/toast';

  const props = withDefaults(
    defineProps<{
      id: string;
      title: string;
      timeout?: number; // milliseconds
      variant?: ToastVariant;
    }>(),
    {
      timeout: 3000,
      variant: 'info',
    },
  );

  const baseUi = {
    wrapper: 'w-full pointer-events-auto',
    container: 'relative overflow-hidden',
    inner: 'w-0 flex-1 ml-2 mr-1 break-normal',
    title: 'text-body',
    description: 'text-body',
    actions: 'flex items-center gap-2 mt-3 flex-shrink-0',
    shadow: 'shadow-lg',
    rounded: 'rounded-2xl',
    padding: 'p-4',
    progress: {
      base: 'absolute bottom-0 end-0 start-0 h-1',
      background: 'bg-primary-200',
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
    container: 'relative overflow-hidden test-toast-info',
    background: 'bg-alert-blue-muted',
    icon: 'i-heroicons-information-circle',
    ring: 'ring-1 ring-blue-900',
    progress: {
      background: 'bg-alert-blue',
    },
  };
  const variantSuccessUi = {
    ...baseUi,
    container: 'relative overflow-hidden ',
    background: 'bg-alert-success-muted test-toast-success',
    icon: 'i-heroicons-check-20-solid',
    ring: 'ring-1 ring-alert-success',
    progress: {
      background: 'bg-alert-success',
    },
  };
  const variantWarningUi = {
    ...baseUi,
    container: 'relative overflow-hidden test-toast-warning',
    background: 'bg-alert-caution-muted',
    icon: 'i-heroicons-information-circle',
    ring: 'ring-1 ring-alert-caution',
    progress: {
      background: 'bg-alert-caution',
    },
  };
  const variantErrorUi = {
    ...baseUi,
    container: 'relative overflow-hidden test-toast-error',
    background: 'bg-alert-danger-muted',
    icon: 'i-heroicons-exclamation-triangle',
    ring: 'ring-1 ring-alert-danger',
    progress: {
      background: 'bg-alert-danger',
    },
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

<style scoped lang="scss">
  // override iconify icon styles (left and right icons) inside UNotification component
  :deep(.iconify) {
    width: 24px !important;
    height: 24px !important;
    color: black;
  }
</style>
