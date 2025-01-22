<script setup lang="ts">
  import { ButtonSizeEnum } from '@FE/types/buttons';
  import { useRunStore } from '@FE/stores';
  import { WipSeqeraRunData } from '@FE/stores/run';

  const props = defineProps<{
    schema: object;
    params: object;
    // TODO: -> workflowId
    pipelineId: string;
  }>();

  const emit = defineEmits(['next-step', 'previous-step', 'step-validated']);
  const $route = useRoute();

  const seqeraRunTempId = $route.query.seqeraRunTempId as string;

  const activeSection = ref<string | null>(null);
  const runStore = useRunStore();

  const wipSeqeraRun = computed<WipSeqeraRunData | undefined>(() => runStore.wipSeqeraRuns[seqeraRunTempId]);

  const localProps = reactive({
    schema: props.schema,
    params: {
      ...props.params,
      input: wipSeqeraRun.value?.sampleSheetS3Url,
      outdir: `s3://${wipSeqeraRun.value?.s3Bucket}/${wipSeqeraRun.value?.s3Path}/results`,
    },
  });

  const schemaDefinitions = computed(() => {
    console.log(JSON.stringify(props.schema.$defs || props.schema.definitions, null, 2));
    return props.schema.$defs || props.schema.definitions;
  });

  onMounted(() => {
    // set first section in side panel of UI to active
    const firstKey = Object.keys(schemaDefinitions.value)[0];
    activeSection.value = schemaDefinitions.value[firstKey].title;
  });

  function nextSection() {
    const currentIndex = Object.values(schemaDefinitions.value).findIndex(
      (section) => section.title == activeSection.value,
    );
    if (currentIndex < Object.values(schemaDefinitions.value).length - 1) {
      activeSection.value = Object.values(schemaDefinitions.value)[currentIndex + 1].title;
    }
  }

  function prevSection() {
    if (!props.schema || !schemaDefinitions.value) {
      return; // Exit if schema or definitions is not available
    }
    const definitionsArray = Object.values(schemaDefinitions.value);
    const currentIndex = definitionsArray.findIndex((section) => section.title === activeSection.value);

    if (currentIndex > 0) {
      activeSection.value = definitionsArray[currentIndex - 1].title;
    }
  }

  function toggleSection(sectionTitle: string) {
    if (activeSection.value !== sectionTitle) {
      activeSection.value = sectionTitle;
    }
  }

  /**
   * Check if all parameters in a section are hidden; this is a helper to
   * hide the section in the side panel
   * @param section
   * @returns boolean
   */
  function checkIfAllSectionParametersHidden(section: object): boolean {
    const filteredProperties = Object.values(section.properties).filter(
      (property: any) => !usePipeline().isParamsFormatFilePath(property.format),
    );

    return filteredProperties.every((property: any) => property.hidden);
  }

  watch(
    // watches for input changes in the local params object and updates the store with the new value
    () => localProps.params,
    (val) => {
      if (val) {
        runStore.updateWipSeqeraRun(seqeraRunTempId, { params: val });
      }
    },
    { deep: true },
  );
</script>

<template>
  <div class="flex">
    <div class="mr-4 w-1/4">
      <EGCard>
        <EGText tag="small" class="mb-4">Step 03</EGText>
        <EGText tag="h4" class="mb-0">Edit Parameters</EGText>
        <UDivider class="py-4" />
        <div
          v-show="!checkIfAllSectionParametersHidden(section)"
          v-for="(section, sectionIndex) in schemaDefinitions"
          :key="`section-${sectionIndex}`"
        >
          <div
            class="mb-4 cursor-pointer text-sm"
            :class="{
              'text-primary bg-primary-muted rounded-xl px-4 py-2 font-semibold': activeSection === section.title,
            }"
            @click="toggleSection(section.title)"
          >
            {{ section.title }}
          </div>
        </div>
      </EGCard>
    </div>
    <div class="w-3/4">
      <EGCard
        v-for="(section, sectionIndex) in Object.values(schemaDefinitions)"
        :key="`section-${sectionIndex}`"
        v-show="activeSection === section.title"
      >
        <EGText tag="h4" class="mb-4">{{ section.title }}</EGText>

        <EGRunWorkflowParameterInputs
          v-for="(section, sectionIndex) in Object.values(schemaDefinitions)"
          :key="`section-${sectionIndex}`"
          v-show="activeSection === section.title"
          :section="<Object>section"
          :params="localProps.params"
          @update:params="
            (val) => {
              localProps.params = { ...val }; // Ensure reactivity on update
            }
          "
        />

        <div class="mt-12 flex justify-end">
          <EGButton
            v-if="sectionIndex > 0"
            :size="ButtonSizeEnum.enum.sm"
            variant="secondary"
            label="Previous"
            @click="prevSection"
          />
          <EGButton
            class="ml-4"
            v-if="sectionIndex < Object.keys(schemaDefinitions).length - 1"
            :size="ButtonSizeEnum.enum.sm"
            variant="secondary"
            label="Next"
            @click="nextSection"
          />
        </div>
      </EGCard>

      <div class="mt-6 flex justify-between">
        <EGButton
          :size="ButtonSizeEnum.enum.sm"
          variant="secondary"
          label="Previous step"
          @click="emit('previous-step')"
        />
        <EGButton :size="ButtonSizeEnum.enum.sm" type="submit" label="Save & Continue" @click="emit('next-step')" />
      </div>
    </div>
  </div>
</template>
