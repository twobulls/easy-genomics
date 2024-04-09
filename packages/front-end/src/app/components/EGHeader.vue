<script setup lang="ts">
  const { logOut, hasAuth } = useAuth();
</script>

<template>
  <header class="center flex flex-row items-center justify-center px-4">
    <div class="header-container flex w-full flex-row items-center justify-between">
      <div class="flex">
        <img class="mr-2 min-w-[140px]" src="@/assets/images/easy-genomics-logo.svg" alt="EasyGenomics logo" />
      </div>
      <div class="flex gap-2">
        <ULink
          to="/runs"
          disabled
          inactive-class="text-grey-500"
          active-class="text-violet-700  bg-violet-100 "
          class="font-heading flex justify-center whitespace-nowrap rounded-xl px-4 py-2 text-base tracking-normal"
        >
          Runs
        </ULink>
        <ULink
          to="/workflows"
          disabled
          inactive-class="text-grey-500"
          active-class="text-violet-700  bg-violet-100 "
          class="font-heading flex justify-center whitespace-nowrap rounded-xl px-4 py-2 text-base tracking-normal"
        >
          Workflows
        </ULink>
        <ULink
          to="/labs"
          inactive-class="text-grey-500"
          active-class="text-violet-700  bg-violet-100 "
          class="font-heading flex justify-center whitespace-nowrap rounded-xl px-4 py-2 text-base tracking-normal"
        >
          Labs
        </ULink>
        <ULink
          to="/organizations"
          disabled
          inactive-class="text-grey-500"
          active-class="text-violet-700  bg-violet-100 "
          class="font-heading flex justify-center whitespace-nowrap rounded-xl px-4 py-2 text-base tracking-normal"
        >
          Organizations
        </ULink>
        <EGButton v-if="hasAuth" @click="logOut()" class="ml-8 h-10" label="Log out" />
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
  //
  //.logo-title {
  //  font-weight: 500;
  //  line-height: normal;
  //  letter-spacing: -0.16px;
  //}
</style>
