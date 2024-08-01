<script setup lang="ts">
  const props = defineProps<{
    name: string;
    details: object;
    modelValue: string;
  }>();
</script>

<template>
  <div>
    <EGText tag="p">{{ name }}</EGText>
    <EGText tag="small">{{ details.description }}</EGText>
    <EGInput :value="modelValue" @input.lazy="$emit('update:modelValue', $event.target.value)" class="mt-1" />
    <EGText v-if="details.help_text" tag="small" color-class="text-muted">
      {{ details.help_text }}
    </EGText>
  </div>
</template>
