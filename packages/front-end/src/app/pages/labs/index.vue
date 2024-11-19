<script setup lang="ts">
  const $router = useRouter();
</script>

<template>
  <EGPageHeader title="Labs" :show-back="false">
    <EGButton
      v-if="useUserStore().canCreateLab()"
      label="Create a new Lab"
      class="self-end"
      @click="() => $router.push({ path: `/labs/create` })"
    />
  </EGPageHeader>

  <EGLabsList :org-id="useUserStore().currentOrgId" />
</template>
