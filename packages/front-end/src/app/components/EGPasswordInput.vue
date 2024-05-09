<script setup lang="ts">
  const props = withDefaults(
    defineProps<{
      password: boolean;
      placeholder?: string;
      disabled?: boolean;
    }>(),
    {
      placeholder: '',
      disabled: false,
    }
  );

  const inputType = props.password ? ref('password') : ref('text');

  function switchVisibility() {
    inputType.value = inputType.value === 'password' ? 'text' : 'password';
  }
</script>

<template>
  <UInput
    :disabled="disabled"
    :ui="{
      icon: { trailing: { pointer: '' } },
      base: 'mt-2 h-12 !shadow-none border-background-stroke-dark !bg-white text-body disabled:bg-background-light-grey disabled:text-muted',
      rounded: 'rounded-md',
      placeholder: 'placeholder-text-muted',
      padding: {
        sm: 'p-4',
      },
    }"
    :type="inputType"
    :placeholder="placeholder"
  >
    <template #trailing>
      <UButton
        color="black"
        variant="link"
        :padded="false"
        :icon="inputType === 'password' ? 'i-heroicons-eye-slash text-red' : 'i-heroicons-eye'"
        @click="switchVisibility"
      />
    </template>
  </UInput>
</template>

<style scoped lang="scss"></style>
