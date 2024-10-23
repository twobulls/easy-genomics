<template>
  <EGAdminAlert />

  <EGOrgsList superuser @click-org="(org) => $router.push({ path: '/orgs/' + org.OrganizationId })" />
</template>
