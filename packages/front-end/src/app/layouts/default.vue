<template>
  <EGToasts class="top-[70px]" />
  <EGHeader />
  <main class="mx-auto mt-12 px-4">
    <slot />
  </main>
</template>

<style scoped lang="scss">
  main {
    max-width: var(--max-page-container-width-px);
  }
</style>
