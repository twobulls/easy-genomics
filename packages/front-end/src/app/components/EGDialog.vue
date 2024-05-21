<script setup lang="ts">
  import { ButtonVariantEnum, ButtonSizeEnum } from '~/types/buttons';

  defineProps<{
    modelValue: any;
    primaryMessage?: string;
    secondaryMessage?: string;
    actionLabel: string;
    actionVariant: string;
    cancelLabel?: string;
    cancelVariant?: string;
  }>();

  const emit = defineEmits(['action-triggered', 'update:modelValue']);

  function handleCancel() {
    emit('update:modelValue', false);
  }
</script>

<template>
  <div class="bg">
    <UModal :modelValue="modelValue" @update:modelValue="(value) => emit('update:modelValue', value)" prevent-close>
      <UCard>
        <template #header>
          <div class="flex flex-col">
            <div class="flex">
              <div class="flex flex-col">
                <div v-if="primaryMessage" class="font-heading mb-6 text-2xl font-medium">
                  {{ primaryMessage }}
                </div>
                <div v-if="secondaryMessage" class="mb-6 text-sm text-gray-600">
                  {{ secondaryMessage }}
                </div>
              </div>
              <div>
                <UButton
                  @click="handleCancel"
                  icon="i-heroicons-x-mark"
                  class="hover:bg-background-dark-grey"
                  color="black"
                  variant="ghost"
                  :ui="{ rounded: 'rounded-full' }"
                />
              </div>
            </div>
            <div class="flex justify-end gap-4">
              <div v-if="cancelLabel">
                <EGButton
                  @click="handleCancel"
                  :label="cancelLabel"
                  :variant="ButtonVariantEnum.enum.secondary"
                  :size="ButtonSizeEnum.enum.sm"
                />
              </div>
              <EGButton
                @click="emit('action-triggered')"
                :label="actionLabel"
                :size="ButtonSizeEnum.enum.sm"
                :variant="ButtonVariantEnum.enum.destructive"
                autofocus
              />
            </div>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<style lang="scss">
  //.bg {
  //  position: fixed;
  //  top: 0;
  //  left: 0;
  //  z-index: 0;
  //  width: 100vw;
  //  height: 100vh;
  //  background-color: rgba(0, 0, 0, 0.4);
  //  backdrop-filter: blur(15px);
  //}
</style>
