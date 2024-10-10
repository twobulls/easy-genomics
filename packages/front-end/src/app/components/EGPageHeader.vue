<script setup lang="ts">
  const props = defineProps<{
    title: string;
    description?: string;
    showBack: boolean;
    backButtonLabel?: string;
    backAction?: () => void;
  }>();

  const router = useRouter();

  const defaultBackAction = () => {
    router.go(-1);
  };

  const description = computed(() => props.description || '');
  const backAction = computed(() => props.backAction || defaultBackAction);
  const backButtonLabel = computed(() => props.backButtonLabel || 'Back');
</script>

<template>
  <div class="mb-6 flex flex-col justify-between">
    <div class="h-[40px]">
      <EGBack v-if="showBack" :label="backButtonLabel" :back-action="backAction" />
    </div>
    <div class="flex items-start justify-between">
      <div>
        <EGText tag="h1" class="mb-0">{{ title }}</EGText>
        <EGText v-if="description" tag="p" class="text-muted mt-4">{{ description }}</EGText>
      </div>
      <div class="relative flex flex-col items-end">
        <!-- Right-aligned content  -->
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
