<script setup lang="ts">
  withDefaults(
    defineProps<{
      placeholder?: string;
      disabled?: boolean;
    }>(),
    {
      placeholder: '',
      disabled: false,
    }
  );
</script>

<template>
  <UInput
    :disabled="disabled"
    :ui="{
      base: 'mt-2 !shadow-none border-background-stroke-dark bg-white text-body disabled:bg-background-light-grey disabled:text-muted',
      rounded: 'rounded-md',
      placeholder: 'placeholder-text-muted',
      padding: {
        sm: 'p-4',
      },
    }"
    :placeholder="placeholder"
  />
</template>

<style scoped lang="scss"></style>
