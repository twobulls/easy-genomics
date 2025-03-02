<script setup lang="ts">
  import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';

  const router = useRouter();
  const route = useRoute();

  const labsStore = useLabsStore();
  const userStore = useUserStore();

  const labId = route.params.labId as string;

  const isOpen = ref<boolean>(false);

  const currentLab = computed<Laboratory | null>(() => labsStore.labs[labId] || null);

  const otherLabs = computed<Laboratory[]>(() => {
    // for superuser, use the org in the url; for normal user, currentOrgId
    const currentOrgId = userStore.isSuperuser ? (route.params.orgId as string) : userStore.currentOrgId;
    return Object.values(labsStore.labsForOrg(currentOrgId || ''))
      .filter((lab) => lab.LaboratoryId !== labId)
      .sort((a, b) => useSort().stringSortCompare(a.Name, b.Name));
  });

  const items = computed<Laboratory[][]>(() =>
    otherLabs.value.map((lab) => [
      {
        ...lab,
        click: () => doSwitchLab(lab.LaboratoryId),
      },
    ]),
  );

  function doSwitchLab(labId: string): void {
    // this is flexible enough to work in most different contexts; eg.
    // - normal user: /labs/[labId]
    // - superuser: /orgs/[orgId]/labs/[labId]
    const newRoute = route.fullPath.replace(/\/labs\/[^\/]+/, `/labs/${labId}`);
    router.push(newRoute);
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
          {{ currentLab?.Name }}
        </UButton>
      </div>
      <template #item="{ item }">
        {{ item.Name }}
      </template>
    </UDropdown>
  </div>
</template>
