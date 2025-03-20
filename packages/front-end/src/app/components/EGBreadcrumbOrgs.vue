<script setup lang="ts">
  import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
  import { ButtonVariantEnum } from '@FE/types/buttons';

  const router = useRouter();
  const route = useRoute();

  const { $api } = useNuxtApp();
  const orgsStore = useOrgsStore();
  const userStore = useUserStore();

  const isOpen = ref<boolean>(false);

  const currentOrg = computed<Organization | null>(() => {
    // for superuser, use the org in the url; for normal user, currentOrgId
    const currentOrgId = userStore.isSuperuser ? (route.params.orgId as string) : userStore.currentOrgId;
    return orgsStore.orgs[currentOrgId || ''] || null;
  });

  const otherOrgs = computed<Organization[]>(() => {
    // the superuser can't "switch" orgs so don't offer any
    if (userStore.isSuperuser) return [];

    return Object.values(orgsStore.orgs)
      .filter((org) => org.OrganizationId !== userStore.currentOrgId)
      .sort((a, b) => useSort().stringSortCompare(a.Name, b.Name));
  });

  const items = computed<Organization[][]>(() =>
    otherOrgs.value.map((org) => [
      {
        ...org,
        click: () => selectSwitchToOrg(org.OrganizationId),
      },
    ]),
  );

  const switchToOrgId = ref<string | null>(null);
  const switchOrgDialogOpen = ref<boolean>(false);

  function selectSwitchToOrg(orgId: string): void {
    switchToOrgId.value = orgId;
    switchOrgDialogOpen.value = true;
  }

  async function doSwitchOrg(): Promise<void> {
    userStore.currentOrg.OrganizationId = switchToOrgId.value!;
    userStore.mostRecentLab.LaboratoryId = null; // Reset

    // update default org/lab in api
    await $api.users.updateUserLastAccessInfo(
      userStore.currentUserDetails.id!,
      userStore.currentOrg.OrganizationId,
      undefined,
    );

    // refresh values from api
    await useAuth().getRefreshedToken();
    await useUser().setCurrentUserDataFromToken();

    router.push('/');
    useUiStore().incrementRemountAppKey();
    useToastStore().success('You have switched organizations');
  }
</script>

<template>
  <div>
    <UDropdown v-model:open="isOpen" :items="items" :popper="{ placement: 'bottom-start' }">
      <div class="font-schibsted">
        <UButton
          variant="ghost"
          :trailing-icon="items.length > 0 ? 'i-heroicons-chevron-up-down' : undefined"
          color="black"
        >
          {{ currentOrg?.Name }}
        </UButton>
      </div>
      <template #item="{ item }">
        <span class="w-full text-left">{{ item.Name }}</span>
      </template>
    </UDropdown>
  </div>

  <EGDialog
    cancel-label="Cancel"
    action-label="Continue"
    :action-variant="ButtonVariantEnum.enum.primary"
    @action-triggered="doSwitchOrg"
    :trigger-delay="2000"
    primary-message="Are you sure you would like to switch organizations?"
    secondary-message="You are about to switch organization accounts. Ensure all unsaved work is saved and reviewed before proceeding. Switching accounts may result in losing access to current session data or active tasks."
    v-model="switchOrgDialogOpen"
  />
</template>
