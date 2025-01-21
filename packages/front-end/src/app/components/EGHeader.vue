<script setup lang="ts">
  import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';
  import { ButtonVariantEnum } from '@FE/types/buttons';

  const props = withDefaults(
    defineProps<{
      isAuthed?: boolean;
    }>(),
    {
      isAuthed: false,
    },
  );

  const { $api } = useNuxtApp();
  const userStore = useUserStore();
  const orgsStore = useOrgsStore();
  const uiStore = useUiStore();

  const { signOutAndRedirect } = useAuth();
  const $router = useRouter();
  const labsPath = '/labs';
  const orgsPath = '/orgs';

  function isSubpath(url: string) {
    return $router.currentRoute.value.path.includes(url);
  }

  const acctDropdownIsOpen = ref<boolean>(false);

  const switchToOrgId = ref<string | null>(null);
  const switchOrgDialogOpen = ref<boolean>(false);

  function selectSwitchToOrg(orgId: string): void {
    switchToOrgId.value = orgId;
    switchOrgDialogOpen.value = true;
  }

  function doSwitchOrg(): void {
    userStore.currentOrg.OrganizationId = switchToOrgId.value!;
    $router.push('/');
    useUiStore().incrementRemountAppKey();
    useToastStore().success('You have switched organizations');
  }

  async function handleStarClick($event: any, orgId: string): Promise<void> {
    $event.stopPropagation();
    await setDefaultOrg(orgId);
  }

  async function setDefaultOrg(orgId: string): Promise<void> {
    if (orgId === userStore.currentUserDetails.defaultOrgId || uiStore.isRequestPending('updateDefaultOrg')) {
      return;
    }

    uiStore.setRequestPending('updateDefaultOrg');
    try {
      await $api.users.updateUserDefaultOrg(userStore.currentUserDetails.id!, orgId);

      // refresh auth session to get updated default org from token
      await useAuth().getRefreshedToken();
      await useUser().setCurrentUserDataFromToken();
    } finally {
      uiStore.setRequestComplete('updateDefaultOrg');
    }
  }

  const dropdownItems = computed<object[][]>(() => {
    const items = [];

    items.push([
      {
        slot: 'profile',
        class: 'bg-background-light-grey p-4',
        click: userStore.isSuperuser ? undefined : () => $router.push('/profile'),
      },
    ]);

    if (!userStore.isSuperuser && otherOrgs.value.length > 0) {
      items.push([
        {
          slot: 'other-orgs',
          class: 'bg-background-light-grey px-4',
        },
      ]);
    }

    items.push([
      {
        label: 'Sign Out',
        class: 'p-4 text-primary underline',
        click: signOutAndRedirect,
      },
    ]);

    return items;
  });

  const otherOrgs = computed<Organization[]>(() =>
    Object.values(orgsStore.orgs)
      .filter((org) => org.OrganizationId !== userStore.currentOrgId)
      .sort((a, b) => useSort().stringSortCompare(a.Name, b.Name)),
  );

  const multipleOrgs = computed<boolean>(
    () => Object.keys(userStore.currentUserPermissions.orgPermissions || {}).length > 1,
  );

  const defaultOrgButtonDynamicClasses = (orgId: string) => ({
    // active style
    'border-6': orgId === userStore.currentUserDetails.defaultOrgId,
    'border-primary':
      orgId === userStore.currentUserDetails.defaultOrgId && !uiStore.isRequestPending('updateDefaultOrg'),
    // changing style
    'border-primary-muted':
      orgId === userStore.currentUserDetails.defaultOrgId && uiStore.isRequestPending('updateDefaultOrg'),
    'bg-background-grey': uiStore.isRequestPending('updateDefaultOrg'),
  });
</script>

<template>
  <header class="lh flex flex-row items-center justify-center">
    <div class="header-container" :class="{ 'flex w-full flex-row items-center justify-between pl-4': props.isAuthed }">
      <template v-if="props.isAuthed">
        <img class="mr-2 w-[140px]" src="@/assets/images/easy-genomics-logo.svg" alt="EasyGenomics logo" />

        <div class="text-muted text-lg" v-if="!!orgsStore.orgs[userStore.currentOrgId]?.Name">
          {{ orgsStore.orgs[userStore.currentOrgId].Name }}
        </div>

        <div class="flex items-center gap-4">
          <ULink
            v-if="!userStore.isSuperuser"
            :to="labsPath"
            inactive-class="text-body"
            active-class="text-primary-dark bg-primary-muted"
            :class="isSubpath(labsPath) ? 'text-primary-dark bg-primary-muted' : ''"
            class="ULink text-body flex h-[30px] items-center justify-center whitespace-nowrap rounded-xl px-4 py-1 font-serif text-sm tracking-normal"
          >
            Labs
          </ULink>
          <ULink
            v-if="userStore.canManageOrgs()"
            :to="orgsPath"
            inactive-class="text-body"
            active-class="text-primary-dark bg-primary-muted"
            :class="isSubpath(orgsPath) ? 'text-primary-dark bg-primary-muted' : ''"
            class="ULink text-body flex h-[30px] items-center justify-center whitespace-nowrap rounded-xl px-4 py-1 font-serif text-sm tracking-normal"
          >
            Organizations
          </ULink>

          <UDropdown
            v-model:open="acctDropdownIsOpen"
            :items="dropdownItems"
            :ui="{
              padding: '',
              width: 'w-80',
              item: {
                base: 'flex flex-col items-start gap-0',
                rounded: '',
              },
            }"
          >
            <EGUserDisplay :initials="userStore.currentUserInitials" />

            <template #profile>
              <div class="flex w-full flex-row items-center gap-3">
                <EGUserDisplay
                  class="grow"
                  :initials="userStore.currentUserInitials"
                  :name="userStore.currentUserDisplayName"
                  :organization="orgsStore.orgs[userStore.currentOrgId]?.Name ?? null"
                />

                <button
                  v-if="!userStore.isSuperuser && multipleOrgs"
                  class="h-6 w-6 rounded-full border bg-white"
                  :class="defaultOrgButtonDynamicClasses(userStore.currentOrgId)"
                  :disabled="uiStore.isRequestPending('updateDefaultOrg')"
                  @click="async ($event) => await handleStarClick($event, userStore.currentOrgId)"
                />

                <UIcon v-if="!userStore.isSuperuser" name="i-heroicons-chevron-right" class="h-6 w-6" />
              </div>
            </template>

            <template #other-orgs>
              <div class="text-muted pt-2">Other Organizations</div>

              <div class="flex w-full flex-col items-start" v-for="(org, i) of otherOrgs">
                <div v-if="i > 0" class="w-full border-t" />

                <div
                  @click="() => selectSwitchToOrg(org.OrganizationId)"
                  class="flex w-full items-center justify-between py-3 text-left"
                >
                  <div class="font-medium">{{ org.Name }}</div>

                  <button
                    v-if="!userStore.isSuperuser && multipleOrgs"
                    class="h-6 w-6 rounded-full border bg-white"
                    :class="defaultOrgButtonDynamicClasses(org.OrganizationId)"
                    :disabled="uiStore.isRequestPending('updateDefaultOrg')"
                    @click="async ($event) => await handleStarClick($event, org.OrganizationId)"
                  />
                </div>
              </div>
            </template>
          </UDropdown>
        </div>
      </template>
      <template v-else>
        <div class="center flex flex-col justify-center text-center">
          <img class="mr-2 w-[140px]" src="@/assets/images/easy-genomics-logo.svg" alt="EasyGenomics logo" />
        </div>
      </template>
    </div>
  </header>

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

<style scoped lang="scss">
  header {
    background-color: white;
    max-width: 100%;
    height: 78px;
  }
  .header-container {
    max-width: var(--max-page-container-width-px);
  }

  .ULink {
    line-height: 1.4rem;
  }

  .border-6 {
    border-width: 6px;
  }
</style>
