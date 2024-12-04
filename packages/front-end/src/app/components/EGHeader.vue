<script setup lang="ts">
  import { Organization } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/organization';

  const props = withDefaults(
    defineProps<{
      isAuthed?: boolean;
    }>(),
    {
      isAuthed: false,
    },
  );

  const userStore = useUserStore();
  const orgsStore = useOrgsStore();

  const { signOut, isAuthed } = useAuth();
  const labsPath = '/labs';
  const orgsPath = '/orgs';
  const { currentRoute } = useRouter();

  function isSubpath(url: string) {
    return currentRoute.value.path.includes(url);
  }

  const acctDropdownIsOpen = ref<boolean>(false);

  const dropdownItems = computed<object[][]>(() => {
    const items = [];

    items.push([
      {
        slot: 'profile',
        class: 'bg-background-light-grey p-4',
      },
    ]);

    if (otherOrgs.value.length > 0) {
      items.push([
        {
          slot: 'other-orgs',
          class: 'bg-background-light-grey p-4',
        },
      ]);
    }

    items.push([
      {
        label: 'Sign Out',
        class: 'p-4',
        click: signOut,
      },
    ]);

    return items;
  });

  const otherOrgs = computed<Organization[]>(() =>
    Object.values(orgsStore.orgs)
      .filter((org) => org.OrganizationId !== userStore.currentOrgId)
      .sort((a, b) => useSort().stringSortCompare(a.Name, b.Name)),
  );
</script>

<template>
  <header class="lh flex flex-row items-center justify-center px-4">
    <div class="header-container" :class="{ 'flex w-full flex-row items-center justify-between': props.isAuthed }">
      <template v-if="props.isAuthed">
        <div class="flex">
          <img class="mr-2 min-w-[140px]" src="@/assets/images/easy-genomics-logo.svg" alt="EasyGenomics logo" />
        </div>
        <div class="flex items-center gap-2">
          <ULink
            v-if="!userStore.isSuperuser"
            to="/labs"
            inactive-class="text-body"
            :active-class="'text-primary-dark bg-primary-muted'"
            :class="isSubpath(labsPath) ? 'text-primary-dark bg-primary-muted' : ''"
            class="ULink text-body flex h-[30px] items-center justify-center whitespace-nowrap rounded-xl px-4 py-1 font-serif text-sm tracking-normal"
          >
            Labs
          </ULink>
          <ULink
            v-if="userStore.canManageOrgs()"
            to="/orgs"
            inactive-class="text-body"
            :active-class="'text-primary-dark bg-primary-muted'"
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
                base: 'flex flex-col items-start',
                rounded: '',
              },
            }"
          >
            <EGInitialsCircle />

            <template #profile>
              <div class="flex flex-row items-center gap-3">
                <EGInitialsCircle />

                <div class="flex flex-col items-start gap-1">
                  <div class="font-medium">
                    {{ userStore.currentUserDisplayName }}
                  </div>
                  <div class="text-muted">
                    {{ orgsStore.orgs[userStore.currentOrgId]?.Name || '' }}
                  </div>
                </div>
              </div>
            </template>

            <template #other-orgs>
              <div class="text-muted pb-2">Other Organizations</div>

              <div class="flex w-full flex-col items-start gap-3" v-for="(org, i) of otherOrgs">
                <div v-if="i > 0" class="mt-2 w-full border" />

                <div class="font-medium">{{ org.Name }}</div>
              </div>
            </template>
          </UDropdown>
        </div>
      </template>
      <template v-else>
        <div class="center flex flex-col justify-center text-center">
          <img class="mr-2 min-w-[140px]" src="@/assets/images/easy-genomics-logo.svg" alt="EasyGenomics logo" />
        </div>
      </template>
    </div>
  </header>
</template>

<style scoped lang="scss">
  header {
    background-color: white;
    max-width: 100%;
    height: 78px;
  }
  .header-container {
    max-width: 1262px;
  }

  .ULink {
    line-height: 1.4rem;
  }
</style>
