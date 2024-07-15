<script setup lang="ts">
  import { Status, StatusEnum } from '@/types/status';
  const props = defineProps<{
    status: Status;
  }>();

  const baseConfig = {
    base: 'inline-flex items-center',
    rounded: 'rounded-xl',
    size: {
      xs: 'text-md px-3.5 py-0.5',
    },
    variant: {
      solid: 'bg-alert-danger-muted text-alert-danger ',
    },
  };

  /**
   * Translate Nextflow Tower's api enums to UI labels
   */
  const STATUS_LABEL_MAP = {
    [StatusEnum.enum.CANCELLED]: 'Failed',
    [StatusEnum.enum.FAILED]: 'Failed',
    [StatusEnum.enum.SUCCEEDED]: 'Completed',
    [StatusEnum.enum.RUNNING]: 'Running',
    [StatusEnum.enum.SUBMITTED]: 'Submitted',
    [StatusEnum.enum.UNKNOWN]: 'Unknown',
  };

  const label = computed(() => STATUS_LABEL_MAP[props.status] ?? 'Unknown');

  const STATUS_STYLE_MAP = {
    [StatusEnum.enum.SUCCEEDED]: {
      solid: 'bg-alert-success-muted text-alert-success',
    },
    [StatusEnum.enum.FAILED]: {
      solid: 'bg-alert-danger-muted text-alert-danger',
    },
    [StatusEnum.enum.CANCELLED]: {
      solid: 'bg-alert-danger-muted text-alert-danger',
    },
    [StatusEnum.enum.RUNNING]: {
      solid: 'bg-primary-muted text-primary',
    },
    [StatusEnum.enum.SUBMITTED]: {
      solid: 'background-dark-grey text-body',
    },
    [StatusEnum.enum.UNKNOWN]: {
      solid: 'background-dark-grey text-body',
    },
  };

  const uiConfig = computed(() => ({
    ...baseConfig,
    variant: STATUS_STYLE_MAP[props.status] ?? 'background-dark-grey text-body',
  }));
</script>
<template>
  <UBadge :ui="uiConfig">{{ label }}</UBadge>
</template>
<style lang="scss"></style>
