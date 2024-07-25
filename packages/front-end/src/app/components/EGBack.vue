<script setup lang="ts">
  const $router = useRouter();
  const props = withDefaults(defineProps<{ label?: string; customBackAction?: () => void | undefined }>(), {
    label: 'Back',
  });
</script>

<template>
  <a
    @click="customBackAction ? customBackAction?.() : $router.go(-1)"
    class="text-primary mb-4 flex w-min cursor-pointer items-center gap-1 whitespace-nowrap text-base font-medium"
  >
    <i class="i-heroicons-arrow-left-solid"></i>
    <span>{{ label }}</span>
  </a>
</template>
