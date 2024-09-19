<script setup lang="ts">
  withDefaults(
    defineProps<{
      modelValue?: string | number;
      disabled?: boolean;
    }>(),
    {
      disabled: false,
    },
  );

  const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <USelect
    :value="modelValue"
    @input="emit('update:modelValue', $event.target.value)"
    :disabled="disabled"
    :ui="{
      icon: { trailing: { pointer: '' } },
      base: 'h-13 !shadow-none border-background-stroke-dark text-body bg-white disabled:text-muted disabled:bg-background-light-grey disabled:opacity-100',
      rounded: 'rounded-md',
      placeholder: 'text-muted',
      padding: {
        sm: 'p-4',
      },
    }"
  />
</template>
