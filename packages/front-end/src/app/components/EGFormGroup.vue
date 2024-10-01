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
    class="[&_label]:text-heading !mt-0 mb-6 [&_label]:mb-1 [&_label]:text-sm [&_label]:font-normal [&_label]:leading-tight [&_p]:mt-[2px]"
    :ui="{
      error: 'text-alert-danger',
    }"
  >
    <slot />
  </UFormGroup>
</template>
