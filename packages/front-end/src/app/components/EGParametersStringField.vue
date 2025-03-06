<script setup lang="ts">
  const props = defineProps<{
    modelValue: string;
    disabled?: boolean;
    description?: string;
    helpText?: string;
  }>();
</script>

<template>
  <div>
    <EGText tag="small">{{ description }}</EGText>
    <EGInput :value="modelValue" @input.lazy="$emit('update:modelValue', $event.target.value)" class="mt-1" />
    <EGText v-if="helpText" tag="small" color-class="text-muted">{{ helpText }}</EGText>
  </div>
</template>
