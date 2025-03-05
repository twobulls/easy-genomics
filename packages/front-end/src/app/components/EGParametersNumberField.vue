<script setup lang="ts">
  const props = defineProps<{
    modelValue: number;
    name?: string;
    description?: string;
    helpText?: string;
  }>();
</script>

<template>
  <div>
    <EGText v-if="name" tag="p">{{ name }}</EGText>
    <EGText v-if="description" tag="small">{{ description }}</EGText>
    <EGInput
      type="number"
      :value="modelValue"
      @input.lazy="$emit('update:modelValue', Number($event.target.value))"
      class="mt-1"
    />
    <EGText v-if="helpText" tag="small" color-class="text-muted">{{ helpText }}</EGText>
  </div>
</template>
