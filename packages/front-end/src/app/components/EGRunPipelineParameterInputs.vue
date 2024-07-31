<script setup lang="ts">
  const props = defineProps<{
    section: object;
    params: object;
  }>();

  const emit = defineEmits<{
    (event: 'update:params', params: object);
  }>();

  /**
   * Returns the input type of the property to help construct the UI
   * @param property
   */
  function propertyType(property) {
    if (property.type === 'string' && property.format === undefined) return 'string';
    if (property.type === 'string' && property.format === 'file-path') return 'file-path';
    if (property.type === 'string' && property.format === 'directory-path') return 'string';
    if (property.type === 'boolean') return 'boolean';
    if (property.type === 'integer') return 'number';
    if (property.type === 'number') return 'number';
  }

  /**
   *  Handles input changes, updates the respective parameter in a copy of the current params, and emits it for
   *  potential parental handling
   * @param key
   * @param newValue
   */
  function onInputChange(key, newValue) {
    let newParams = { ...props.params };
    newParams[key] = newValue;
    emit('update:params', newParams);
  }
</script>

<template>
  <div>
    <div v-for="(propertyDetail, propertyName) in section.properties" :key="propertyName" class="mb-6">
      <div v-if="propertyType(propertyDetail) === 'string' || propertyType(propertyDetail) === 'number'">
        <EGText tag="p">{{ propertyName }}</EGText>
        <EGText tag="small">{{ propertyDetail.description }}</EGText>
        <EGInput
          :value="props.params[propertyName]"
          @input.lazy="(event) => onInputChange(propertyName, event.target.value)"
          class="mt-1"
        />
        <EGText v-if="propertyDetail.help_text" tag="small" color-class="text-muted">
          {{ propertyDetail.help_text }}
        </EGText>
      </div>

      <div v-else-if="propertyType(propertyDetail) === 'boolean'" class="flex flex-col">
        <EGText tag="p">{{ propertyName }}</EGText>
        <EGText tag="small">{{ propertyDetail.description }}</EGText>
        <UToggle
          :checked="props.params[propertyName]"
          @change="(event) => onInputChange(propertyName, event.target.checked)"
          class="mt-2"
        />
      </div>
    </div>
  </div>
</template>
