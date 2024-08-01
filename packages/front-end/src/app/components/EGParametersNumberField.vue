<script setup lang="ts">
  const props = defineProps<{
    name: string;
    details: object;
    modelValue: number;
  }>();

  let { modelValue } = toRefs(props);

  watch(
    modelValue,
    (newVal) => {
      if (newVal === undefined) {
        modelValue.value = 0;
      }
    },
    { immediate: true },
  );
</script>

<template>
  <div>
    <EGText tag="p">{{ name }}</EGText>
    <EGText tag="small">{{ details.description }}</EGText>
    <EGInput
      type="number"
      :value="modelValue"
      @input.lazy="$emit('update:modelValue', Number($event.target.value))"
      class="mt-1"
    />
    <EGText v-if="details.help_text" tag="small" color-class="text-muted">
      {{ details.help_text }}
    </EGText>
  </div>
</template>
