<script setup lang="ts">
  withDefaults(
    defineProps<{
      placeholder?: string;
      disabled?: boolean;
      required?: boolean;
    }>(),
    {
      placeholder: '',
      disabled: false,
      required: false,
    },
  );
</script>

<template>
  <UTextarea
    :disabled="disabled"
    :ui="{
      base: 'mt-2 !shadow-none border-background-dark-grey bg-white text-body disabled:text-muted disabled:bg-background-light-grey disabled:opacity-100',
      rounded: 'rounded-md',
      placeholder: 'text-muted',
      padding: {
        sm: 'p-4',
      },
    }"
    :placeholder="placeholder"
    :required="required"
  />
</template>

<style scoped lang="scss"></style>
