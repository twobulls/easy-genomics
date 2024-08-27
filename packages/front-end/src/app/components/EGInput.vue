<script setup lang="ts">
  withDefaults(
    defineProps<{
      modelValue?: string | number;
      placeholder?: string;
      disabled?: boolean;
      clearable?: boolean;
      autocomplete?: string;
    }>(),
    {
      placeholder: '',
      disabled: false,
      autocomplete: '',
    },
  );

  function clear() {
    emit('update:modelValue', '');
  }

  const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <UInput
    :autocomplete="autocomplete"
    :value="modelValue"
    @input="emit('update:modelValue', $event.target.value)"
    name="q"
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
    :placeholder="placeholder"
  >
    <template #trailing v-if="clearable">
      <UButton
        v-show="modelValue !== ''"
        color="black"
        variant="link"
        icon="i-heroicons-x-mark-20-solid"
        :padded="false"
        @click="clear"
      />
    </template>
  </UInput>
</template>

<style scoped lang="scss"></style>
