<script lang="ts" setup>
  const props = withDefaults(
    defineProps<{
      confirmAction: () => void;
      confirmLabel?: string;
      title?: string;
      message?: string;
      preventClose?: boolean;
    }>(),
    {
      title: '',
      message: '',
      preventClose: false,
    },
  );

  function onSuccess() {
    props.confirmAction();
  }
</script>

<template>
  <UModal
    prevent-close
    :ui="{
      overlay: {
        base: 'fixed inset-0 transition-opacity backdrop-blur-[5px]',
        background: 'bg-gray-800/30',
      },
      rounded: 'rounded-3xl',
    }"
  >
    <UCard
      :ui="{
        base: 'p-10',
        rounded: 'rounded-3xl',
        header: {
          padding: '',
        },
      }"
    >
      <div class="space-y-2">
        <EGText tag="h3" v-if="title" class="mb-8">{{ title }}</EGText>
        <EGText tag="p" v-if="message">{{ message }}</EGText>
        <div class="flex justify-end">
          <EGButton @click="onSuccess()" :label="confirmLabel" variant="secondary" />
        </div>
      </div>
    </UCard>
  </UModal>
</template>
