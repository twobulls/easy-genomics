<script setup lang="ts">
  const props = defineProps<{
    name: string;
    details: object;
    modelValue: boolean;
  }>();

  const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="flex flex-col">
    <EGText tag="p">{{ name }}</EGText>
    <EGText tag="small">{{ details.description }}</EGText>
    <UToggle :modelValue="modelValue" @change="(value) => emit('update:modelValue', value)" class="mt-2" />
  </div>
</template>
