<script setup lang="ts">
  const $router = useRouter();
  const props = withDefaults(defineProps<{ label?: string; backAction?: () => void }>(), {
    label: 'Back',
    backAction: undefined,
  });
</script>

<template>
  <a
    @click="backAction ? backAction?.() : $router.push(useUiStore().previousPageRoute)"
    class="text-primary mb-4 flex w-min cursor-pointer items-center gap-1 whitespace-nowrap text-base font-medium"
  >
    <UIcon name="i-heroicons-arrow-left-solid" />
    <span>{{ label }}</span>
  </a>
</template>
