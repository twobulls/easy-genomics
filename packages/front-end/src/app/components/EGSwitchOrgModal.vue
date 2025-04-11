<script setup lang="ts">
  import { ButtonVariantEnum } from '@FE/types/buttons';

  const props = defineProps<{
    switchToOrgId: string | null;
  }>();
  const model = defineModel();

  const { $api } = useNuxtApp();
  const $router = useRouter();

  const userStore = useUserStore();
  const uiStore = useUiStore();

  async function doSwitchOrg(): Promise<void> {
    uiStore.setRequestPending('switchOrg');

    try {
      userStore.mostRecentLab.LaboratoryId = null; // Reset

      // update default org/lab in api
      await $api.users.updateUserLastAccessInfo(userStore.currentUserDetails.id!, props.switchToOrgId, undefined);

      // refresh values from api
      await useAuth().getRefreshedToken();
      await useUser().setCurrentUserDataFromToken();

      $router.push('/');

      // I hate this delay but there's a really screwy race condition otherwise
      // it causes a bad bug where the new org will open to the previous org's lab, which shouldn't even be possible
      setTimeout(() => {
        uiStore.incrementRemountAppKey();
        useToastStore().success('You have switched organizations');
        uiStore.setRequestComplete('switchOrg');
      }, 100);
    } catch (e) {
      uiStore.setRequestComplete('switchOrg');
      throw e;
    }
  }
</script>

<template>
  <EGDialog
    cancel-label="Cancel"
    action-label="Continue"
    :action-variant="ButtonVariantEnum.enum.primary"
    @action-triggered="doSwitchOrg"
    primary-message="Are you sure you would like to switch organizations?"
    secondary-message="You are about to switch organization accounts. Ensure all unsaved work is saved and reviewed before proceeding. Switching accounts may result in losing access to current session data or active tasks."
    :loading="uiStore.isRequestPending('switchOrg')"
    v-model="model"
  />
</template>
