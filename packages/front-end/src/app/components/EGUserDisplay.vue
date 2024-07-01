<!-- TODO: replace all code for displaying combinations of a user avatar, display name, and email with this EGUserDisplay component - https://dept-au.atlassian.net/browse/EG-504
For example from packages/front-end/src/app/pages/orgs/view/[id].vue:

<div class="flex items-center">
  <EGUserAvatar class="mr-4" :name="useUser().displayName({
    preferredName: row.PreferredName,
    firstName: row.FirstName,
    lastName: row.LastName,
    email: row.UserEmail,
  })
    " :email="row.UserEmail" :is-active="row.OrganizationUserStatus === 'Active'" />
  <div class="flex flex-col">
    <div>
      {{
        row.FirstName
          ? useUser().displayName({
            preferredName: row.PreferredName,
            firstName: row.FirstName,
            lastName: row.LastName,
            email: row.UserEmail,
          })
          : ''
      }}
    </div>
    <div class="text-muted text-xs font-normal">{{ (row as OrganizationUserDetails).UserEmail }}</div>
  </div>
</div> -->

<script setup lang="ts">
  import { UserStatus } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/status';

  withDefaults(
    defineProps<{
      displayName: string;
      email: string;
      status: UserStatus;
      showAvatar?: boolean;
    }>(),
    {
      showAvatar: false,
    }
  );
</script>

<template>
  <div class="flex items-center">
    <EGUserAvatarNew v-if="showAvatar" class="mr-4" :display-name="displayName" :email="email" :status="status" />
    <div class="flex flex-col">
      <div>{{ displayName }}</div>
      <div v-if="displayName !== email" class="text-muted text-xs font-normal">{{ email }}</div>
    </div>
  </div>
</template>
