<script setup lang="ts">
  withDefaults(
    defineProps<{
      padding?: number;
    }>(),
    {
      padding: 6,
    },
  );
</script>

<template>
  <UCard
    :ui="{
      shadow: 'shadow-none',
      body: {
        base: 'p-0 shadow-none',
        padding: `sm:p-${padding}`,
      },
      rounded: 'rounded-2xl',
      border: 'stroke-light',
    }"
  >
    <slot />
  </UCard>
</template>

<style scoped lang="scss"></style>
