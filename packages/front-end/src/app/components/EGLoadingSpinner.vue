<template>
  <img src="@/assets/icons/spinner.svg" class="spinner" />
</template>

<script setup lang="ts"></script>

<style scoped>
  .spinner {
    width: 24px;
    height: 24px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
</style>
