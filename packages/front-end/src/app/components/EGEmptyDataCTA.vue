<script setup lang="ts">
  import { ButtonSizeEnum } from '~/types/buttons';

  const props = defineProps<{
    message: string;
    buttonLabel?: string | undefined;
    buttonAction?: () => void | undefined;
    imgSrc?: string;
  }>();

  const imageSrc = computed(() => props.imgSrc || '/images/empty-state-default.jpg');
</script>

<template>
  <section class="rounded-2xl border border-solid border-neutral-200 bg-white px-12 py-9 max-md:px-5">
    <div class="flex justify-between gap-5 max-md:flex-col max-md:gap-0">
      <div class="flex w-6/12 flex-col max-md:ml-0 max-md:w-full">
        <div class="my-auto flex flex-col self-stretch font-medium max-md:mt-10">
          <h3 class="text-heading text-2xl leading-8">{{ message }}</h3>
          <EGButton
            v-if="buttonAction"
            :size="ButtonSizeEnum.enum.lg"
            @click="buttonAction"
            :label="buttonLabel"
            class="mt-6 justify-center self-start px-6 py-4 max-md:px-5"
          />
        </div>
      </div>
      <div class="align ml-5 flex w-4/12 flex-col max-md:ml-0 max-md:w-[338px]">
        <img loading="lazy" :src="imageSrc" class="w-full grow max-md:mt-10 max-md:max-w-full" />
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss"></style>
