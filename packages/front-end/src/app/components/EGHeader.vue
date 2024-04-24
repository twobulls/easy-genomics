<script setup lang="ts">
  const { logOut, hasAuth } = useAuth();
</script>

<template>
  <header class="lh flex flex-row items-center justify-center px-4">
    <div class="header-container flex w-full flex-row items-center justify-between">
      <div class="flex">
        <img class="mr-2 min-w-[140px]" src="@/assets/images/easy-genomics-logo.svg" alt="EasyGenomics logo" />
      </div>
      <div class="flex items-center gap-2">
        <ULink
          to="/runs"
          disabled
          inactive-class="text-body"
          active-class="text-primary bg-primary-muted"
          class="ULink font-heading flex h-[30px] items-center justify-center whitespace-nowrap rounded-xl px-4 py-1 text-sm tracking-normal"
        >
          Runs
        </ULink>
        <ULink
          to="/workflows"
          disabled
          inactive-class="text-body"
          active-class="text-primary bg-primary-muted"
          class="ULink font-heading flex h-[30px] items-center justify-center whitespace-nowrap rounded-xl px-4 py-1 text-sm tracking-normal"
        >
          Workflows
        </ULink>
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
          active-class="text-violet-700 bg-violet-100"
          class="ULink font-heading flex h-[30px] items-center justify-center whitespace-nowrap rounded-xl px-4 py-1 text-sm leading-5 tracking-normal"
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

  .ULink {
    line-height: 1.4rem;
  }
</style>

<!-- FIXME -->
<!--&lt;!&ndash; Tailwind custom classes but be non-scoped &ndash;&gt;-->
<!--<style lang="scss">-->
<!--  .nav-link {-->
<!--    height: 30px;-->
<!--    @apply font-heading space-nowrap flex items-center justify-center rounded-xl px-4 py-1 text-sm tracking-normal text-white;-->
<!--  }-->
<!--  .nav-link&#45;&#45;inactive {-->
<!--    @apply text-muted;-->
<!--  }-->
<!--  .nav-link&#45;&#45;active {-->
<!--    @apply text-primary bg-primary-muted;-->
<!--  }-->
<!--</style>-->
