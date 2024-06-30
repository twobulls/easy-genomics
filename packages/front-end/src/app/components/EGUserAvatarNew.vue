<!-- Supersedes the old EGUserAvatar.vue component - https://dept-au.atlassian.net/browse/EG-504 -->
<script setup lang="ts">
  import { UserStatusSchema, UserStatus } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/status';

  const props = defineProps<{
    displayName: string;
    email: string;
    status: UserStatus;
  }>();

  function getInitials() {
    if (props.displayName === props.email) {
      // Return uppercase first letter of display name
      return props.displayName[0].toUpperCase();
    }

    // Return uppercase initials of display name
    return props.displayName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  }

  const initials = getInitials();
  const avatarColour =
    props.status === UserStatusSchema.enum.Active ? 'bg-primary-dark text-white' : 'bg-primary-muted text-primary-dark';
</script>

<template>
  <div class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-normal" :class="avatarColour">
    {{ initials }}
  </div>
</template>

<style scoped lang="scss"></style>
