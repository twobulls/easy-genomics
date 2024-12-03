<script setup lang="ts">
  import { ButtonSizeEnum } from '@FE/types/buttons';

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

  const items = [
    [
      {
        slot: 'profile',
        class: 'bg-background-light-grey p-4',
      },
    ],
    [
      {
        slot: 'other-orgs',
        class: 'bg-background-light-grey',
      },
    ],
    [
      {
        slot: 'sign-out',
      },
    ],
  ];
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
            :items="items"
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
                    {{ userStore.currentUserDetails.firstName }} {{ userStore.currentUserDetails.lastName }}
                  </div>
                  <div class="text-muted">
                    {{ orgsStore.orgs[userStore.currentOrgId].Name }}
                  </div>
                </div>
              </div>
            </template>

            <template #other-orgs>
              <p>other organizations</p>
              <p>organization name</p>
              <p>organization name</p>
            </template>

            <template #sign-out>sign out</template>
          </UDropdown>
          <EGButton
            :size="ButtonSizeEnum.enum.sm"
            v-if="isAuthed"
            @click="signOut()"
            class="ml-8 h-10"
            label="Sign Out"
          />
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
