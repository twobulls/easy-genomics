<script setup lang="ts">
  import { ButtonSizeEnum } from '@FE/types/buttons';
  import { usePipelineRunStore } from '@FE/stores';

  const props = defineProps<{
    schema: object;
    params: object;
  }>();

  const { $api } = useNuxtApp();
  const emit = defineEmits(['next-step', 'previous-step', 'step-validated']);

  const activeSection = ref<string | null>(null);

  const localProps = reactive({
    schema: props.schema,
    params: { ...props.params },
  });

  const pipelineRunStore = usePipelineRunStore();

  onMounted(() => {
    // set first section in side panel of UI to active
    const definitions = props.schema.definitions;
    const firstKey = Object.keys(definitions)[0];
    activeSection.value = definitions[firstKey].title;
  });

  function nextSection() {
    const currentIndex = Object.values(props.schema.definitions).findIndex(
      (section) => section.title == activeSection.value,
    );
    if (currentIndex < Object.values(props.schema.definitions).length - 1) {
      activeSection.value = Object.values(props.schema.definitions)[currentIndex + 1].title;
    }
  }

  function prevSection() {
    if (!props.schema || !props.schema.definitions) {
      return; // Exit if schema or definitions is not available
    }
    const definitionsArray = Object.values(props.schema.definitions);
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

  watch(
    // watches for input changes in the local params object and updates the store with the new value
    () => localProps.params,
    (val) => {
      if (val) {
        pipelineRunStore.setParams(val);
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
        <div v-for="(section, sectionIndex) in schema.definitions" :key="`section-${sectionIndex}`">
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
        v-for="(section, sectionIndex) in Object.values(schema.definitions)"
        :key="`section-${sectionIndex}`"
        v-show="activeSection === section.title"
      >
        <EGText tag="h4" class="mb-4">{{ section.title }}</EGText>

        <EGRunPipelineParameterInputs
          v-for="(section, sectionIndex) in Object.values(schema.definitions)"
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
            v-if="sectionIndex < Object.keys(schema.definitions).length - 1"
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
