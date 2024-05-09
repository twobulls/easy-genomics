<script setup lang="ts">
  defineProps<{
    whiteVariant: boolean;
  }>();
</script>

<template>
  <img
    :style="whiteVariant ? 'filter:  brightness(0) invert(1);' : ''"
    src="@/assets/images/easy-genomics-logo.svg"
    alt="EasyGenomics logo"
  />
</template>
