<script setup lang="ts">
  import { useToastStore } from '~/stores/stores';
  const toastStore = useToastStore();
</script>

<template>
  <div
    class="pointer-events-none fixed bottom-auto end-0 right-[-8px] top-[70px] z-[55] flex w-full flex-col justify-center sm:w-96"
    role="region"
  >
    <div class="space-y-3 overflow-y-auto px-4 py-6 sm:px-6">
      <EGToast
        v-for="toast in toastStore.toasts"
        :key="toast.id"
        :id="toast.id"
        :title="toast.title"
        :variant="toast.variant"
        :callback="() => toastStore.remove(toast.id)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
