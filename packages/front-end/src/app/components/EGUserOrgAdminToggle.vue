<script setup lang="ts">
  import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
  import { useToastStore } from '@FE/stores';
  import useUser from '@FE/composables/useUser';
  import { VALIDATION_MESSAGES } from '@FE/constants/validation';

  const { $api } = useNuxtApp();
  const props = defineProps<{
    orgId: string;
    user: OrganizationUserDetails;
    isLoading?: boolean;
  }>();

  const emit = defineEmits(['update-user']);
  const { UserId, UserEmail, OrganizationUserStatus } = props.user;
  const toggleVal = ref(props.user.OrganizationAdmin);

  const nameDetails = {
    preferredName: props.user?.PreferredName,
    firstName: props.user?.FirstName,
    lastName: props.user?.LastName,
    email: props.user.UserEmail,
  };
  const displayName = useUser().displayName(nameDetails);
  const initials = useUser().initials(nameDetails);

  async function toggleOrgAdminPerm() {
    toggleVal.value = !toggleVal.value;
    try {
      await $api.orgs.editOrgUser(props.orgId, UserId, OrganizationUserStatus, toggleVal.value);
      emit('update-user');
      useToastStore().success(`${displayName}’s Access has been successfully updated`);
    } catch (error) {
      useToastStore().error(VALIDATION_MESSAGES.network);
      toggleVal.value = !toggleVal.value;
      console.error(error);
    }
  }

  // prevents the email showing if the display name is the same as the email
  const showEmail = computed(() => {
    return displayName !== UserEmail;
  });
</script>

<template>
  <div class="bg-skeleton-container flex h-[82px] items-center rounded p-4" v-if="isLoading">
    <div class="mr-2">
      <USkeleton class="h-[32px] w-[32px]" :ui="{ rounded: 'rounded-full' }" />
    </div>
    <div class="space-y-2">
      <USkeleton class="h-4 w-[250px] rounded" />
      <USkeleton class="h-3 w-[200px] rounded" />
    </div>
  </div>

  <div
    v-else
    class="border-stroke-light flex h-[82px] items-center justify-between gap-3 rounded border border-solid bg-white p-4"
  >
    <div class="flex items-center gap-3">
      <EGUserDisplay
        :initials="initials"
        :name="displayName"
        :email="showEmail ? UserEmail : null"
        :inactive="OrganizationUserStatus !== 'Active'"
      />
    </div>
    <div class="flex cursor-pointer items-center" @click="toggleOrgAdminPerm()">
      <span class="text-xs">Organization Admin</span>
      <UToggle
        class="ml-2"
        :model-value="toggleVal"
        :ui="{
          base: 'test-org-admin-toggle',
        }"
      />
    </div>
  </div>
</template>
