<script setup lang="ts">
  defineProps<{
    label: string;
    name: string;
  }>();
</script>

<template>
  <UFormGroup :label="label" :name="name" class="[&_label]:font-normal">
    <slot />
  </UFormGroup>
</template>

<style scoped lang="scss"></style>
