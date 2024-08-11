<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      title: string;
      description?: string;
      showBack?: boolean;
      backButtonLabel?: string;
      backAction: () => void;
    }>(),
    {
      description: '',
      showBack: true,
    },
  );
</script>

<template>
  <div class="mb-6 flex flex-col justify-between">
    <div class="h-[40px]">
      <EGBack v-if="showBack" :label="backButtonLabel" :back-action="backAction" />
    </div>
    <div class="flex items-start justify-between">
      <div>
        <EGText tag="h1" class="mb-0">{{ title }}</EGText>
        <EGText v-if="description" tag="p" class="text-muted mt-4">{{ description }}</EGText>
      </div>
      <div class="relative flex flex-col items-end">
        <!-- Right-aligned content  -->
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
