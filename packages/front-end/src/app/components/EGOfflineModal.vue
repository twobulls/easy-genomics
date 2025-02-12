<script setup lang="ts">
  const props = defineProps<{
    modelValue: any;
  }>();
</script>

<template>
  <UModal
    :modelValue="modelValue"
    @update:modelValue="(value) => emit('update:modelValue', value)"
    prevent-close
    :ui="{
      overlay: {
        base: 'fixed inset-0 transition-opacity backdrop-blur-[5px]',
        background: 'bg-gray-800/30',
      },
    }"
  >
    <UCard>
      <template #header>
        <div class="flex flex-col">
          <div class="mb-6 flex items-center justify-between">
            <EGText tag="h3">Network connection lost</EGText>
            <EGLoadingSpinner class="flex-end flex" />
          </div>
          <EGText tag="p" class="mb-6">
            Waiting for connection to be re-established. Please hold until you are back online.
          </EGText>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
