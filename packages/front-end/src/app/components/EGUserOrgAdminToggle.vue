<script setup lang="ts">
  import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
  import { useToastStore } from '~/stores/stores';
  const { $api } = useNuxtApp();

  const props = defineProps<{
    user: OrganizationUserDetails;
    displayName: string;
  }>();

  const $emit = defineEmits(['update-user']);
  const { UserId, OrganizationId, UserStatus, UserEmail, OrganizationUserStatus } = props.user;
  const toggleVal = ref(props.user.OrganizationAdmin);

  async function toggleOrgAdminPerm() {
    toggleVal.value = !toggleVal.value;
    try {
      await $api.orgs.editUserRole(OrganizationId, UserId, UserStatus, toggleVal.value);
      $emit('update-user');
      useToastStore().success(`${props.displayName}’s Lab Access has been successfully updated`);
    } catch (error) {
      useToastStore().error('Huh, something went wrong. Please check your connection and try again');
      toggleVal.value = !toggleVal.value;
      console.error(error);
    }
  }
</script>

<template>
  <div class="border-stroke-light flex items-center justify-between gap-3 rounded border border-solid bg-white p-4">
    <div class="flex items-center gap-3">
      <EGUserAvatar
        :name="displayName"
        :email="UserEmail"
        size="large"
        :is-active="OrganizationUserStatus === 'Active'"
      />
      <div class="flex flex-col">
        <EGText tag="div" color-class="text-black">{{ displayName }}</EGText>
        <EGText tag="small" color-class="text-muted">{{ UserEmail }}</EGText>
      </div>
    </div>
    <div class="flex items-center">
      <span class="text-xs">Organization Admin</span>
      <UToggle :model-value="toggleVal" @click="toggleOrgAdminPerm()" class="ml-2" />
    </div>
  </div>
</template>
