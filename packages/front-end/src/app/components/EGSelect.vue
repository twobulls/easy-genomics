<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      disabled?: boolean;
      modelValue: string;
      placeholder?: string;
      options: any[];
    }>(),
    {
      disabled: false,
      options: [],
      placeholder: 'Select',
    },
  );

  const emit = defineEmits(['update:modelValue']);
  const internalModelValue = ref(props.modelValue);

  watch(
    () => props.modelValue,
    (newValue) => {
      internalModelValue.value = newValue;
    },
  );

  // Emit the update event when internalModelValue changes
  function updateModelValue(newValue: string) {
    emit('update:modelValue', newValue);
  }
</script>

<template>
  <div class="">
    <USelectMenu
      :ui="{
        icon: { trailing: { pointer: '' } },
        base: 'h-13 !shadow-none border-background-stroke-dark text-body bg-white disabled:text-muted disabled:bg-background-light-grey disabled:opacity-100',
        rounded: 'rounded-md',
        placeholder: 'text-muted',
        padding: {
          sm: 'p-4',
        },
      }"
      :disabled="disabled"
      :options="options"
      :searchable-placeholder="placeholder"
      :model-value="modelValue"
      @update:modelValue="updateModelValue"
      searchable
    />
  </div>
</template>
