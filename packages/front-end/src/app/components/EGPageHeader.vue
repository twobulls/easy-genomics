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
      showOrgBreadcrumb?: boolean;
      showLabBreadcrumb?: boolean;
      breadcrumbs?: string[];
    }>(),
    {
      backButtonLabel: 'Back',
      isLoading: false,
      backAction: () => {},
      description: '',
    },
  );

  const skeletonTitleLines = computed(() => props.skeletonConfig?.titleLines ?? 1);
  const skeletonDescriptionLines = computed(() => props.skeletonConfig?.descriptionLines ?? 1);

  const breadcrumbs = computed<string[]>(() => props.breadcrumbs?.filter((crumb: string) => !!crumb) || []);
</script>

<template>
  <div class="mb-6 flex flex-col justify-between">
    <div class="min-h-[40px]">
      <div class="mb-4 flex flex-row items-center gap-6">
        <EGBack v-if="showBack" :label="backButtonLabel" :back-action="backAction" />

        <div class="font-schibsted text-muted flex flex-row items-center gap-4 text-sm">
          <EGBreadcrumbOrgs v-if="showOrgBreadcrumb" />

          <template v-if="showLabBreadcrumb">
            <div>/</div>
            <EGBreadcrumbLabs />
          </template>

          <template v-if="breadcrumbs" v-for="crumb in breadcrumbs">
            <div>/</div>
            <div>{{ crumb }}</div>
          </template>
        </div>
      </div>

      <EGAdminAlert v-if="useUserStore().isSuperuser" class="mb-4" />
    </div>
    <div class="flex min-h-[52px] items-start justify-between">
      <div class="w-full">
        <template v-if="isLoading">
          <USkeleton v-for="line in skeletonTitleLines" class="mb-2 min-h-12 w-3/4 rounded" :key="line" />
          <USkeleton v-for="line in skeletonDescriptionLines" class="mt-4 min-h-5 w-[150px] rounded" :key="line" />
        </template>
        <template v-else>
          <EGText tag="h1" class="mb-0">{{ title }}</EGText>
          <EGText v-if="description" tag="p" class="text-muted mt-4 rounded">{{ description }}</EGText>
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
