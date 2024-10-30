<script setup lang="ts">
  interface AccordionItem {
    label: string;
    icon?: string;
    defaultOpen?: boolean;
    disabled?: boolean;
    content?: string;
  }

  const props = defineProps<{
    items: AccordionItem[];
  }>();
</script>

<template>
  <UAccordion
    multiple
    :items="items"
    variant="ghost"
    size="xl"
    :ui="{
      container: 'w-full flex flex-col border-t pb-0 mb-0 border-b-none ',
      item: {
        padding: 'pt-0 pb-0 ',
      },
      default: {
        class: 'mb-0 w-full py-4 text-heading hover:bg-primary-muted rounded-none',
      },
    }"
  >
    <template v-for="item in props.items" #item="{ item }">
      <slot name="item" :item="item" />
    </template>
  </UAccordion>
</template>
