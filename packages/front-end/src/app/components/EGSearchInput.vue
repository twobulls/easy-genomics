<script setup lang="ts">
  withDefaults(
    defineProps<{
      placeholder: string;
      disabled?: boolean;
    }>(),
    {
      placeholder: 'Search',
      disabled: false,
    },
  );

  const searchTerm = ref('');

  const emit = defineEmits<{
    (event: 'input-event', data: string): void;
  }>();

  watch(searchTerm, (newValue) => {
    emit('input-event', newValue);
  });
</script>

<template>
  <UInput
    v-model="searchTerm"
    name="searchTerm"
    :placeholder="placeholder"
    :disabled="disabled"
    icon="i-heroicons-magnifying-glass-20-solid"
    autocomplete="off"
    :trailing="true"
    :ui="{
      placeholder: 'placeholder-text-muted',
      focus: 'outline-none border-0',
      icon: {
        base: 'text-neutral-black w-[24px] h-[24px] ',
      },
      padding: {
        sm: 'px-5 py-4',
      },
      color: {
        white: {
          outline: 'shadow-none focus:ring-1',
        },
      },
    }"
  />
</template>

<style scoped lang="scss"></style>
