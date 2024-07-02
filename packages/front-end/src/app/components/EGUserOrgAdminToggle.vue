<script setup lang="ts">
  import { OrganizationUserDetails } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization-user-details';
  import { useToastStore } from '~/stores';
  import useUser from '~/composables/useUser';
  import { VALIDATION_MESSAGES } from '~/constants/validation';

  const { $api } = useNuxtApp();
  const props = defineProps<{
    user: OrganizationUserDetails;
    isLoading?: boolean;
  }>();

  const $emit = defineEmits(['update-user']);
  const { UserId, OrganizationId, UserEmail, OrganizationUserStatus } = props.user;
  const toggleVal = ref(props.user.OrganizationAdmin);
  const displayName = useUser().displayName({
    preferredName: props.user?.PreferredName,
    firstName: props.user?.FirstName,
    lastName: props.user?.LastName,
    email: props.user.UserEmail,
  });

  async function toggleOrgAdminPerm() {
    toggleVal.value = !toggleVal.value;
    try {
      await $api.orgs.editOrgUser(OrganizationId, UserId, OrganizationUserStatus, toggleVal.value);
      $emit('update-user');
      useToastStore().success(`${displayName}’s Lab Access has been successfully updated`);
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
      <USkeleton class="h-4 w-[250px] rounded-full" />
      <USkeleton class="h-3 w-[200px] rounded-full" />
    </div>
  </div>

  <div
    v-else
    class="border-stroke-light flex h-[82px] items-center justify-between gap-3 rounded border border-solid bg-white p-4"
  >
    <div class="flex items-center gap-3">
      <EGUserAvatar
        :name="displayName"
        :email="UserEmail"
        size="large"
        :is-active="OrganizationUserStatus === 'Active'"
      />
      <div class="flex flex-col">
        <EGText tag="div" color-class="text-black">{{ displayName }}</EGText>
        <EGText v-if="showEmail" tag="small" color-class="text-muted">{{ UserEmail }}</EGText>
      </div>
    </div>
    <div class="flex items-center">
      <span class="text-xs">Organization Admin</span>
      <UToggle :model-value="toggleVal" @click="toggleOrgAdminPerm()" class="ml-2" />
    </div>
  </div>
</template>
