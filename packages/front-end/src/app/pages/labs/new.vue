<script setup lang="ts">
import { FormModeEnum } from '~/types/labs';
</script>

<template>
  <div class="w-full">
    <EGBack />
    <EGText tag="h1" class="mb-6">Create a new lab</EGText>
    <EGText tag="h4" class="mb-4">Lab details</EGText>
  </div>

  <EGLabDetailsForm :form-mode="FormModeEnum.enum.Create" />
</template>
