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
    class="[&_label]:text-heading !mt-0 mb-10 [&_label]:mb-2 [&_label]:text-sm [&_label]:font-normal [&_label]:leading-tight [&_p]:absolute [&_p]:mt-[2px]"
    :ui="{
      error: 'text-alert-danger',
    }"
  >
    <slot />
  </UFormGroup>
</template>
