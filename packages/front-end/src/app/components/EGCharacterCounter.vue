<script setup lang="ts">
  defineProps<{
    value: number;
    max: number;
  }>();
</script>

<template>
  <div class="text-muted absolute right-0 py-1 text-xs font-normal">{{ value }}/{{ max }} characters</div>
</template>
