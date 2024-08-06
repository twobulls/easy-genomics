<script setup lang="ts">
  import { ButtonSizeEnum } from '~/types/buttons';

  const props = withDefaults(
    defineProps<{
      isAuthed?: boolean;
    }>(),
    {
      isAuthed: false,
    },
  );

  const { signOut, isAuthed } = useAuth();
  const labsPath = '/labs';
  const orgsPath = '/orgs';
  const { currentRoute } = useRouter();

  function isSubpath(url: string) {
    return currentRoute.value.path.includes(url);
  }
</script>

<template>
  <header class="lh flex flex-row items-center justify-center px-4">
    <div class="header-container" :class="{ 'flex w-full flex-row items-center justify-between': props.isAuthed }">
      <template v-if="props.isAuthed">
        <div class="flex">
          <img class="mr-2 min-w-[140px]" src="@/assets/images/easy-genomics-logo.svg" alt="EasyGenomics logo" />
        </div>
        <div class="flex items-center gap-2">
          <!-- TODO: build pages for Runs and Workflow -->
          <!--        <ULink-->
          <!--          to="/runs"-->
          <!--          inactive-class="text-body"-->
          <!--          active-class="text-primary bg-primary-muted"-->
          <!--          class="ULink font-serif flex h-[30px] items-center justify-center whitespace-nowrap rounded-xl px-4 py-1 text-sm tracking-normal"-->
          <!--        >-->
          <!--          Runs-->
          <!--        </ULink>-->
          <!--        <ULink-->
          <!--          to="/workflows"-->
          <!--          inactive-class="text-body"-->
          <!--          active-class="text-primary bg-primary-muted"-->
          <!--          class="ULink font-serif flex h-[30px] items-center justify-center whitespace-nowrap rounded-xl px-4 py-1 text-sm tracking-normal"-->
          <!--        >-->
          <!--          Workflows-->
          <!--        </ULink>-->
          <ULink
            to="/labs"
            inactive-class="text-body"
            :active-class="'text-primary-dark bg-primary-muted'"
            :class="isSubpath(labsPath) ? 'text-primary-dark bg-primary-muted' : ''"
            class="ULink text-body flex h-[30px] items-center justify-center whitespace-nowrap rounded-xl px-4 py-1 font-serif text-sm tracking-normal"
          >
            Labs
          </ULink>
          <ULink
            to="/orgs"
            inactive-class="text-body"
            :active-class="'text-primary-dark bg-primary-muted'"
            :class="isSubpath(orgsPath) ? 'text-primary-dark bg-primary-muted' : ''"
            class="ULink text-body flex h-[30px] items-center justify-center whitespace-nowrap rounded-xl px-4 py-1 font-serif text-sm tracking-normal"
          >
            Organizations
          </ULink>
          <EGButton
            :size="ButtonSizeEnum.enum.sm"
            v-if="isAuthed"
            @click="signOut()"
            class="ml-8 h-10"
            label="Sign Out"
            :disabled="true"
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
