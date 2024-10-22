<script setup lang="ts">
  const $route = useRoute();
  const $router = useRouter();

  const labId = $route.params.labId as string;
  const initialTab = $route.query.tab as string;

  // check permissions to be on this page
  if (!useUserStore().canViewLab(useUserStore().currentOrgId, labId)) {
    $router.push('/labs');
  }
</script>

<template>
  <EGLabView :superuser="false" :lab-id="labId" :initial-tab="initialTab" />
</template>
