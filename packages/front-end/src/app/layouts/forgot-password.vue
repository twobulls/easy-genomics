<script setup lang="ts">
  const router = useRouter();
</script>

<template>
  <EGToasts class="top-[70px]" />
  <EGHeader />

  <main class="mx-auto mt-12 flex flex-col justify-center px-4">
    <EGBack label="Previous" @click="() => router.push({ path: '/' })" />
    <slot />
  </main>
</template>

<style scoped lang="scss">
  main {
    max-width: var(--max-page-container-width-px);
  }
</style>
