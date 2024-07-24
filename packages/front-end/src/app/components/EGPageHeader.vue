<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      title: string;
      description?: string;
      showBack?: boolean;
    }>(),
    {
      description: '',
      showBack: true,
    },
  );
</script>

<template>
  <div class="mb-6 flex flex-col justify-between">
    <EGBack v-if="showBack" />
    <div class="flex items-start justify-between">
      <div>
        <EGText tag="p" class="text-muted">{{ description }}</EGText>
        <EGText tag="h1" class="mb-0">{{ title }}</EGText>
      </div>
      <div class="relative flex flex-col items-end">
        <!-- Right-aligned content  -->
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
