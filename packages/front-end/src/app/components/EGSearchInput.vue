<script setup lang="ts">
  withDefaults(
    defineProps<{
      placeholder: string;
    }>(),
    {
      placeholder: 'Search',
    }
  );

  const searchTerm = ref('');

  const emit = defineEmits<{
    (event: 'output', data: searchTerm): void;
  }>();

  watch(searchTerm, (newValue) => {
    emit('output', newValue);
  });
</script>

<template>
  <UInput
    v-model="searchTerm"
    name="searchTerm"
    :placeholder="placeholder"
    icon="i-heroicons-magnifying-glass-20-solid"
    autocomplete="off"
    trailing="true"
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
