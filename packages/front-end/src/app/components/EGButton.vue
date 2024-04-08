<script setup lang="ts">
  type ButtonSize = 'sm' | 'md' | 'lg';
  type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

  withDefaults(
    defineProps<{
      label: string;
      variant?: ButtonVariant;
      bold?: boolean;
      size?: ButtonSize;
    }>(),
    {
      variant: 'primary',
    }
  );
</script>

<template>
  <!-- TODO: variant styles -->
  <UButton
    class="EGButton btn text-body h-10 min-w-24 justify-center rounded-lg px-6 py-3 shadow-none"
    :class="{
      'bg-primary hover:bg-primary-dark text-black text-white disabled:bg-gray-400 disabled:opacity-100':
        variant === 'primary',
      'border-lifeline-dark-blue-200 hover:bg-lifeline-dark-blue-100 border border-solid bg-white  hover:text-white ':
        variant === 'secondary',
      ' hover:bg-lifeline-dark-blue-50 text-white': variant === 'ghost',
      ' hover:bg-lifeline-dark-blue-50 text-white': variant === 'destructive',
      'font-semibold': bold,
    }"
  >
    <slot name="leftIcon" />
    {{ label }}
    <slot name="rightIcon" />
  </UButton>
</template>

<style scoped lang="scss">
  .EGButton {
    transition: 0.2s all ease;
  }
</style>
