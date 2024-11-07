<script setup lang="ts">
  const $route = useRoute();
  const $router = useRouter();

  const canCreateLab = computed<boolean>(
    () => !useUserStore().isSuperuser && useUserStore().canCreateLab(useUserStore().currentOrgId),
  );
</script>

<template>
  <EGPageHeader title="Labs" :show-back="false">
    <EGButton
      v-if="canCreateLab"
      label="Create a new Lab"
      class="self-end"
      @click="() => $router.push({ path: `/labs/create` })"
    />
  </EGPageHeader>

  <EGLabsList :org-id="useUserStore().currentOrgId" />
</template>
