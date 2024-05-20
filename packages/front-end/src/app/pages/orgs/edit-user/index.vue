<script setup lang="ts">
  import { useOrgsStore } from '~/stores/stores';
  const { $api } = useNuxtApp();
  const $route = useRoute();

  const isReady = ref(false);

  async function updateSelectedUser() {
    try {
      const user = await $api.orgs.usersDetailsByUserId($route.query.userId);
      if (user.length) {
        useOrgsStore().setSelectedUser(user[0]);
        isReady.value = true;
      }
    } catch (error) {
      console.error(error);
    }
  }

  onMounted(async () => {
    await updateSelectedUser();
  });
</script>

<template>
  <EGPageHeader title="Edit User Access" />

  <EGUserOrgAdminToggle
    v-if="isReady"
    :user="useOrgsStore().selectedUser"
    :display-name="useOrgsStore().userDisplayName"
    @update-user="updateSelectedUser($event)"
  />
</template>

<style scoped></style>
