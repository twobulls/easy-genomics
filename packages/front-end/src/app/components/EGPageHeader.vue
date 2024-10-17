<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      title: string;
      description?: string;
      showBack: boolean;
      backButtonLabel?: string;
      backAction?: () => void;
      isLoading?: boolean;
      skeletonConfig?: {
        titleLines?: number;
        descriptionLines?: number;
      };
    }>(),
    {
      backButtonLabel: 'Back',
      isLoading: false,
      backAction: () => {},
      description: '',
    },
  );

  const router = useRouter();

  const skeletonTitleLines = computed(() => props.skeletonConfig?.titleLines ?? 1);
  const skeletonDescriptionLines = computed(() => props.skeletonConfig?.descriptionLines ?? 1);
</script>

<template>
  <div class="mb-6 flex flex-col justify-between">
    <div class="h-[40px]">
      <EGBack v-if="showBack" :label="backButtonLabel" :back-action="backAction" />
    </div>
    <div class="flex items-start justify-between">
      <div class="w-full">
        <template v-if="isLoading">
          <USkeleton v-for="line in skeletonTitleLines" class="mb-2 min-h-10 w-3/4 rounded-3xl" :key="line" />
          <USkeleton v-for="line in skeletonDescriptionLines" class="mt-4 min-h-4 w-[150px] rounded-3xl" :key="line" />
        </template>
        <template v-else>
          <EGText tag="h1" class="mb-0">{{ title }}</EGText>
          <EGText v-if="description" tag="p" class="text-muted mt-4 rounded-3xl">{{ description }}</EGText>
        </template>
      </div>
      <div class="relative flex flex-col items-end">
        <!-- Right-aligned content  -->
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .skeleton {
    background: #e0e0e0;
    height: 1em;
    margin-bottom: 0.5em;
    border-radius: 4px;
  }
</style>
