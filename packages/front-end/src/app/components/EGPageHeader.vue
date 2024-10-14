<script setup lang="ts">
  const props = defineProps<{
    title: string;
    description?: string;
    showBack: boolean;
    backButtonLabel?: string;
    backAction?: () => void;
    isLoading?: boolean;
  }>();

  const router = useRouter();

  const defaultBackAction = () => {};
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
      <div class="w-full">
        <template v-if="isLoading">
          <USkeleton class="mb-1 min-h-10 w-3/4 rounded-3xl" />
          <USkeleton v-if="isLoading" class="min-h-10 w-1/2 rounded-3xl" />
        </template>
        <EGText v-else tag="h1" class="mb-0">{{ title }}</EGText>
        <USkeleton v-if="isLoading" class="mt-4 min-h-4 w-[150px] rounded-3xl" />
        <EGText v-else v-if="description" tag="p" class="text-muted mt-4">{{ description }}</EGText>
      </div>
      <div class="relative flex flex-col items-end">
        <!-- Right-aligned content  -->
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss"></style>
