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
    <EGUserAvatarNew v-if="showAvatar" class="mr-4" :displayName="displayName" :email="email" :status="status" />
    <div class="flex flex-col">
      <div>{{ displayName }}</div>
      <div class="text-muted text-xs font-normal">{{ email }}</div>
    </div>
  </div>
</template>