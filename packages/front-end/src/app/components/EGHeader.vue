<script setup lang="ts">
  import { ButtonVariantEnum, ButtonSizeEnum } from '~/types/buttons';
  const { logOut, hasAuth } = useAuth();
  const labsPath = '/labs';
  const orgsPath = '/orgs';
</script>

<template>
  <header class="lh flex flex-row items-center justify-center px-4">
    <div class="header-container flex w-full flex-row items-center justify-between">
      <div class="flex">
        <img class="mr-2 min-w-[140px]" src="@/assets/images/easy-genomics-logo.svg" alt="EasyGenomics logo" />
      </div>
      <div class="flex items-center gap-2">
        <!-- TODO: build pages for Runs and Workflow -->
        <!--        <ULink-->
        <!--          to="/runs"-->
        <!--          inactive-class="text-body"-->
        <!--          active-class="text-primary bg-primary-muted"-->
        <!--          class="ULink font-heading flex h-[30px] items-center justify-center whitespace-nowrap rounded-xl px-4 py-1 text-sm tracking-normal"-->
        <!--        >-->
        <!--          Runs-->
        <!--        </ULink>-->
        <!--        <ULink-->
        <!--          to="/workflows"-->
        <!--          inactive-class="text-body"-->
        <!--          active-class="text-primary bg-primary-muted"-->
        <!--          class="ULink font-heading flex h-[30px] items-center justify-center whitespace-nowrap rounded-xl px-4 py-1 text-sm tracking-normal"-->
        <!--        >-->
        <!--          Workflows-->
        <!--        </ULink>-->
        <ULink
          to="/labs"
          inactive-class="text-body"
          active-class="text-violet-700 bg-violet-100"
          class="ULink text-body font-heading flex h-[30px] items-center justify-center whitespace-nowrap rounded-xl px-4 py-1 text-sm tracking-normal"
        >
          Labs
        </ULink>
        <ULink
          to="/orgs"
          inactive-class="text-body"
          :active-class="isSubpath(orgsPath) ? 'text-violet-700 bg-violet-100' : ''"
          class="ULink font-heading flex h-[30px] items-center justify-center whitespace-nowrap rounded-xl px-4 py-1 text-sm leading-5 tracking-normal"
        >
          Organizations
        </ULink>
        <EGButton :size="ButtonSizeEnum.enum.sm" v-if="hasAuth" @click="logOut()" class="ml-8 h-10" label="Log out" />
      </div>
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
