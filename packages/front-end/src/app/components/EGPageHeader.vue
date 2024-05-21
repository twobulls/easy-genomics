<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      title: string;
      description?: string;
    }>(),
    {
      description: '',
    }
  );
</script>

<template>
  <div class="mb-4 flex flex-col justify-between">
    <EGBack />
    <div class="flex items-start justify-between">
      <div>
        <EGText tag="h1" class="mb-4">{{ title }}</EGText>
        <EGText tag="p" class="text-muted">{{ description }}</EGText>
      </div>
      <div class="relative flex flex-col items-end">
        <!-- Right-aligned content  -->
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
