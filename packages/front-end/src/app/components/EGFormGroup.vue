<script setup lang="ts">
  defineProps<{
    label: string;
    name: string;
  }>();
</script>

<template>
  <UFormGroup
    :label="label"
    :name="name"
    class="[&_label]:text-heading [&_label]:text-sm [&_label]:font-normal [&_label]:leading-tight [&_p]:absolute [&_p]:mt-[2px]"
  >
    <slot />
  </UFormGroup>
</template>

<style scoped lang="scss"></style>
