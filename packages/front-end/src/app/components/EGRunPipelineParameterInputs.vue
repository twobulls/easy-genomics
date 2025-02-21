<script setup lang="ts">
  import StringField from './EGParametersStringField.vue';
  import NumberField from './EGParametersNumberField.vue';
  import BooleanField from './EGParametersBooleanField.vue';
  import { useRunStore } from '@FE/stores';

  const props = defineProps<{
    section: Record<string, any>;
    params: Record<string, any>;
  }>();

  const $route = useRoute();
  const runStore = useRunStore();

  const seqeraRunTempId = $route.query.seqeraRunTempId as string;

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
      if (propName === 'input') {
        // Set initial input with generated param value, then use existing value to maintain any user modifications
        propValues[propName] = !propValues[propName] ? props.params[propName] : propValues[propName];
      } else if (propName === 'outdir') {
        // Set initial outdir with generated param value, then use existing value to maintain any user modifications
        propValues[propName] = !propValues[propName] ? props.params[propName] : propValues[propName];
      } else {
        propValues[propName] = props.params[propName];
      }
    }
  });

  watchEffect(() => {
    for (const key in propValues) {
      runStore.wipSeqeraRuns[seqeraRunTempId].params[key] = propValues[key];
    }
  });
</script>

<template>
  <div>
    <div v-for="(propertyDetail, propertyName) in section.properties" :key="propertyName" class="mb-6">
      <!-- ignore Seqera "file upload" input types -->
      <template v-if="!propertyDetail?.hidden && !usePipeline().isParamsFormatFilePath(propertyDetail.format)">
        <EGFormGroup
          :label="propertyName"
          :required="runStore.wipSeqeraRuns[seqeraRunTempId].paramsRequired.includes(propertyName)"
        >
          <component
            :is="components[propertyType(propertyDetail)]"
            :name="''"
            :details="propertyDetail"
            v-model="propValues[propertyName]"
          />
        </EGFormGroup>
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
        <EGFormGroup
          label="input"
          name="input"
          :required="runStore.wipSeqeraRuns[seqeraRunTempId].paramsRequired.includes('input')"
        >
          <EGInput name="input" v-model="propValues['input']" />
        </EGFormGroup>
      </template>
    </div>
  </div>
</template>
