<script setup lang="ts">
  const props = defineProps({ items: { type: Array, required: true } });
  const isOpen = ref(false);

  const isHighlighted = computed(() => props.items.flat().some((item) => item.isHighlighted));
</script>

<template>
  <UDropdown class="EGActionButton" v-model:open="isOpen" :items="items" :popper="{ placement: 'bottom-start' }">
    <div class="rounded-full border">
      <UButton
        :class="{ active: isOpen.value, 'is-highlighted': isHighlighted.value }"
        class="hover:bg-null testClass h-10 w-10 justify-center text-black"
        variant="ghost"
        icon="i-heroicons-ellipsis-horizontal-20-solid"
      />
    </div>
  </UDropdown>
</template>

<style lang="scss">
  .EGActionButton {
    .p-1 {
      padding: 8px 12px;
    }
  }

  .is-highlighted {
    button {
      color: #ef5c45;
    }
    &:hover {
      color: #ef5c45;
    }
  }

  .active {
    border-radius: 100px;
    background-color: #c2c2c2;
  }
</style>
