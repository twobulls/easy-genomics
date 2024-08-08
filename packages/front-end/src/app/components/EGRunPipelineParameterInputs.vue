<script setup lang="ts">
  import StringField from './EGParametersStringField.vue';
  import NumberField from './EGParametersNumberField.vue';
  import BooleanField from './EGParametersBooleanField.vue';

  const props = defineProps<{
    section: object;
    params: object;
  }>();

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

  function downloadSampleSheet() {
    const csvString = usePipelineRunStore().sampleSheetCsv;
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `samplesheet-${usePipelineRunStore().pipelineName}--${usePipelineRunStore().userPipelineRunName}.csv`,
    );
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
</script>

<template>
  <div>
    <div v-for="(propertyDetail, propertyName) in section.properties" :key="propertyName" class="mb-6">
      <template v-if="!propertyDetail?.hidden && propertyDetail.format === 'file-path' && propertyName === 'input'">
        <component
          :is="components[propertyType(propertyDetail)]"
          name="input"
          :disabled="true"
          :details="propertyDetail"
          v-model="usePipelineRunStore().S3Url"
          :hide-description="true"
        />
        <EGButton label="Download sample sheet" class="mt-2" @click="downloadSampleSheet()" />
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
