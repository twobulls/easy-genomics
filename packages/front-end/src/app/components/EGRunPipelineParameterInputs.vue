<script setup lang="ts">
  import StringField from './EGParametersStringField.vue';
  import NumberField from './EGParametersNumberField.vue';
  import BooleanField from './EGParametersBooleanField.vue';
  import { usePipelineRunStore } from '@FE/stores';

  const props = defineProps<{
    section: Record<string, any>;
    params: Record<string, any>;
  }>();

  const pipelineRunStore = usePipelineRunStore();

  function propertyType(property) {
    if (property.type === 'string' && property.format === undefined) return 'EGParametersStringField';
    if (property.type === 'string' && property.format === 'path') return 'EGParametersStringField';
    if (property.type === 'string' && usePipeline().isParamsFormatFilePath(property.format))
      return 'EGParametersStringField';
    if (property.type === 'string' && property.format === 'directory-path') return 'EGParametersStringField';
    if (property.type === 'boolean') return 'EGParametersBooleanField';
    if (property.type === 'integer') return 'EGParametersNumberField';
    if (property.type === 'number') return 'EGParametersNumberField';
  }

  const components = {
    EGParametersStringField: StringField,
    EGParametersNumberField: NumberField,
    EGParametersBooleanField: BooleanField,
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

  watchEffect(() => {
    for (const key in propValues) {
      pipelineRunStore.params[key] = propValues[key];
    }
  });
</script>

<template>
  <div>
    <div v-for="(propertyDetail, propertyName) in section.properties" :key="propertyName" class="mb-6">
      <!-- ignore Seqera "file upload" input types -->
      <template v-if="!propertyDetail?.hidden && !usePipeline().isParamsFormatFilePath(propertyDetail.format)">
        <component
          :is="components[propertyType(propertyDetail)]"
          :name="propertyName"
          :details="propertyDetail"
          v-model="propValues[propertyName]"
        />
      </template>

      <!-- Special exception for Seqera "file upload" input type at this point in the schema, used as an S3 bucket
      directory input field -->
      <template
        v-if="
          !propertyDetail?.hidden &&
          usePipeline().isParamsFormatFilePath(propertyDetail.format) &&
          propertyName === 'input'
        "
      >
        <EGInput name="input" v-model="pipelineRunStore.S3Url" />
      </template>
    </div>
  </div>
</template>
