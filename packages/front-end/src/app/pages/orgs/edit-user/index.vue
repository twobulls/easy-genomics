<script setup lang="ts">
  import { useOrgsStore } from '~/stores/stores';
  const { $api } = useNuxtApp();
  const $route = useRoute();

  const isLoading = ref(true);

  async function updateSelectedUser() {
    try {
      const user = await $api.orgs.usersDetailsByUserId($route.query.userId);
      if (user.length) {
        useOrgsStore().setSelectedUser(user[0]);
        isLoading.value = false;
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
  <USkeleton class="flex h-[82px] flex-col rounded bg-gray-200 p-6 max-md:px-5" v-if="isLoading" />
  <EGUserOrgAdminToggle
    v-if="!isLoading"
    :user="useOrgsStore().selectedUser"
    :display-name="useOrgsStore().userDisplayName"
    @update-user="updateSelectedUser($event)"
  />
</template>

<style scoped></style>
