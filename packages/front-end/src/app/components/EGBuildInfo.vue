<script setup lang="ts">
  const { GITHUB_RUN_NUMBER } = useRuntimeConfig().public;
</script>
<template>
  <div class="pointer-events-none fixed bottom-2 right-2 opacity-80">
    <div class="rounded bg-gray-800 px-2 py-2 text-xs text-white">#{{ GITHUB_RUN_NUMBER }}</div>
  </div>
</template>
