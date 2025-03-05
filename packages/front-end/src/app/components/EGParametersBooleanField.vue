<script setup lang="ts">
  const props = defineProps<{
    modelValue: boolean;
    description?: string;
    helpText?: string;
  }>();

  const emit = defineEmits(['update:modelValue']);
</script>

<template>
  <div class="flex flex-col">
    <EGText v-if="description" tag="small">{{ description }}</EGText>
    <UToggle :modelValue="modelValue" @change="(value) => emit('update:modelValue', value)" class="mt-2" />
    <EGText v-if="helpText" tag="small" color-class="text-muted">{{ helpText }}</EGText>
  </div>
</template>
