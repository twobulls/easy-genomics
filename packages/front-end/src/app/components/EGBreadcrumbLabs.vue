<script setup lang="ts">
  import { Laboratory } from '@easy-genomics/shared-lib/src/app/types/easy-genomics/laboratory';
  import { ButtonVariantEnum } from '@FE/types/buttons';

  const router = useRouter();
  const route = useRoute();

  const labsStore = useLabsStore();
  const userStore = useUserStore();

  const labId = route.params.labId as string;

  const isOpen = ref<boolean>(false);

  const currentLab = computed<Laboratory | null>(() => labsStore.labs[labId] || null);

  const otherLabs = computed<Laboratory[]>(() =>
    Object.values(labsStore.labsForOrg(userStore.currentOrgId || ''))
      .filter((lab) => lab.LaboratoryId !== labId)
      .sort((a, b) => useSort().stringSortCompare(a.Name, b.Name)),
  );

  const items = computed<Laboratory[][]>(() =>
    otherLabs.value.map((lab) => [
      {
        ...lab,
        click: () => doSwitchLab(lab.LaboratoryId),
      },
    ]),
  );

  function doSwitchLab(labId: string): void {
    router.push(`/labs/${labId}`);
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
          {{ currentLab.Name }}
        </UButton>
      </div>
      <template #item="{ item }">
        {{ item.Name }}
      </template>
    </UDropdown>
  </div>
</template>
