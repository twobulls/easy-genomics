<script setup lang="ts">
  import { ButtonVariantEnum, ButtonSizeEnum } from '@FE/types/buttons';

  defineProps<{
    modelValue: any;
    primaryMessage?: string;
    secondaryMessage?: string;
    actionLabel: string;
    actionVariant: string;
    cancelLabel?: string;
    cancelVariant?: string;
    buttonsDisabled?: boolean;
  }>();

  const emit = defineEmits(['action-triggered', 'update:modelValue']);

  function handleCancel() {
    emit('update:modelValue', false);
  }
</script>

<template>
  <UModal :modelValue="modelValue" @update:modelValue="(value) => emit('update:modelValue', value)" prevent-close>
    <UCard>
      <template #header>
        <div class="flex flex-col">
          <div class="flex">
            <EGText tag="h3" class="mb-6">{{ primaryMessage }}</EGText>
            <div>
              <UButton
                @click="handleCancel"
                icon="i-heroicons-x-mark"
                class="hover:bg-background-dark-grey ml-2"
                color="black"
                variant="ghost"
                :ui="{ rounded: 'rounded-full' }"
              />
            </div>
          </div>
          <div v-if="secondaryMessage">
            <EGText tag="p" class="mb-6">{{ secondaryMessage }}</EGText>
          </div>
          <div class="flex justify-end gap-4">
            <div v-if="cancelLabel">
              <EGButton
                @click="handleCancel"
                :label="cancelLabel"
                :variant="ButtonVariantEnum.enum.secondary"
                :size="ButtonSizeEnum.enum.sm"
                :disabled="buttonsDisabled"
              />
            </div>
            <EGButton
              @click="emit('action-triggered')"
              :label="actionLabel"
              :size="ButtonSizeEnum.enum.sm"
              :variant="actionVariant"
              :disabled="buttonsDisabled"
              autofocus
            />
          </div>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
