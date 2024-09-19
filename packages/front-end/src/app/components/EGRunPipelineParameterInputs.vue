<script setup lang="ts">
  import StringField from './EGParametersStringField.vue';
  import NumberField from './EGParametersNumberField.vue';
  import BooleanField from './EGParametersBooleanField.vue';

  const props = defineProps<{
    section: object;
    params: object;
  }>();

  const emit = defineEmits(['next-step', 'step-validated']);

  function propertyType(property) {
    if (property.type === 'string' && property.format === undefined) return 'EGParametersStringField';
    if (property.type === 'string' && property.format === 'path') return 'EGParametersStringField';
    if (property.type === 'string' && property.format === 'file-path') return 'EGParametersStringField';
    if (property.type === 'string' && property.format === 'directory-path') return 'EGParametersStringField';
    if (property.type === 'boolean') return 'EGParametersBooleanField';
    if (property.type === 'integer') return 'EGParametersNumberField';
    if (property.type === 'number') return 'EGParametersNumberField';
  }

  const components = {
    'EGParametersStringField': StringField,
    'EGParametersNumberField': NumberField,
    'EGParametersBooleanField': BooleanField,
  };

  const propValues = reactive({});
  Object.keys(props.section.properties).forEach((propName) => {
    if (props.params[propName] === undefined) {
      if (propertyType(props.section.properties[propName]) === 'EGParametersNumberField') {
        propValues[propName] = 0; // Initialize number fields to 0 if not defined
      } else if (propertyType(props.section.properties[propName]) === 'EGParametersStringField') {
        propValues[propName] = ''; // Initialize string fields to empty string if not defined
      } else {
        propValues[propName] = false; // Initialize boolean fields to false if not defined
      }
    } else {
      propValues[propName] = props.params[propName];
    }
  });

  /**
   * Lists a file previously uploaded and/or use the default file path if exists
   */
  const filePathSelections = computed(() => {
    const uploadedS3Url = usePipelineRunStore().S3Url;
    const defaultUrl = usePipelineRunStore().params?.input;

    const selections = uploadedS3Url ? [uploadedS3Url, defaultUrl].filter(Boolean) : [defaultUrl ?? 'N/A'];
    return selections;
  });

  const defaultFileUrl = computed({
    get: () => filePathSelections.value[0],
    set: (value) => {
      currentValue.value = value;
    },
  });
</script>

<template>
  <div>
    <div v-for="(propertyDetail, propertyName) in section.properties" :key="propertyName" class="mb-6">
      <template v-if="!propertyDetail?.hidden && propertyDetail.format === 'file-path' && propertyName === 'input'">
        <p class="text-alert-danger pb-2 text-sm" v-if="!usePipeline().doesFileUrlExist">
          No file found. Please upload files in the previous step in order to proceed.
        </p>
        <EGSelect v-model="defaultFileUrl" :options="filePathSelections" :disabled="!usePipeline().doesFileUrlExist" />
      </template>
      <!-- ignore Seqera "file upload" input types  -->
      <template v-if="!propertyDetail?.hidden && propertyDetail.format !== 'file-path'">
        <component
          :is="components[propertyType(propertyDetail)]"
          :name="propertyName"
          :details="propertyDetail"
          v-model="propValues[propertyName]"
        />
      </template>
    </div>
  </div>
</template>
