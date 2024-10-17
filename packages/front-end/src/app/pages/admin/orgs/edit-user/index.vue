<script setup lang="ts">
  const $router = useRouter();

  // require superuser for admin page
  if (!useUserStore().isSuperuser) {
    $router.push('/');
  }
</script>

<template>
  <EGAdminAlert />

  <EGUserAccess admin :org-admin="false" />
</template>
