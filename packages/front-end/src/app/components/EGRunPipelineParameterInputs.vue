<script setup lang="ts">
  import StringField from './EGParametersStringField.vue';
  import NumberField from './EGParametersNumberField.vue';
  import BooleanField from './EGParametersBooleanField.vue';

  const props = defineProps<{
    section: Record<string, any>;
    params: Record<string, any>;
    seqeraRunTempId: string;
  }>();

  const runStore = useRunStore();

  function componentForType(property: { type: 'string' | 'integer' | 'number' | 'boolean' }) {
    switch (property.type) {
      case 'string':
        return StringField;
      case 'integer':
      case 'number':
        return NumberField;
      case 'boolean':
        return BooleanField;
    }
  }
</script>

<template>
  <div>
    <div v-for="(propertyDetail, propertyName) in section.properties" :key="propertyName" class="mb-6">
      <template v-if="!propertyDetail?.hidden">
        <EGFormGroup
          :label="propertyName"
          :name="propertyName"
          :required="runStore.wipSeqeraRuns[props.seqeraRunTempId].paramsRequired.includes(propertyName)"
        >
          <component
            :is="componentForType(propertyDetail)"
            :name="propertyName"
            :details="propertyDetail"
            v-model="runStore.wipSeqeraRuns[props.seqeraRunTempId].params[propertyName]"
          />
        </EGFormGroup>
      </template>
    </div>
  </div>
</template>
