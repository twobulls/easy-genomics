<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      title: string;
      description?: string;
      showBackButton?: boolean;
      backButtonLabel?: string;
      backButtonAction?: void | (() => void);
    }>(),
    {
      description: '',
      showBackButton: true,
    },
  );
</script>

<template>
  <div class="mb-6 flex flex-col justify-between">
    <EGBack
      v-if="showBackButton"
      :label="backButtonLabel"
      :custom-back-action="backButtonAction ? backButtonAction : undefined"
    />
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
