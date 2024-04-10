<script setup lang="ts">
  /**
   * Renders different HTML tags based on the provided tag prop.
   * It can render headings from h1 to h6, paragraph, div, and span, each with specific styles defined in the style section.
   * Specifies a color class to use for the element being rendered.
   */
  defineProps({
    tag: {
      type: [String, Number],
      validator: (tag: string) => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span'].includes(tag),
    },
    colorClass: {
      default: 'text-lifeline-dark-blue-100',
      type: String,
    },
  });
</script>

<template>
  <component
    :is="tag"
    :class="[
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(tag) ? `font-heading  ${colorClass}` : '',
      ['p', 'span', 'div'].includes(tag) ? 'text-lifeline-dark-blue-200' : '',
    ]"
  >
    <slot />
  </component>
</template>

<style scoped lang="scss">
  h1,
  h2,
  h3,
  h4,
  h5,
  h6 {
    font-family: 'PlusJakartaSans', sans-serif;
    font-weight: 600;
  }
  h1 {
    font-size: 36px;
    line-height: 42px;
    font-style: normal;

    > p {
      margin-bottom: 1.875rem;
    }
  }
  h2,
  h3,
  h4,
  h5 {
    font-size: 1.25rem; /* 20px */
    line-height: 1.75rem; /* 28px */
    font-weight: bold;
    letter-spacing: -0.14px;

    > p {
      margin-bottom: 1.2rem;
    }
  }

  p,
  div,
  span {
    font-family: 'Inter', sans-serif;
    font-size: 1rem; /* 16px */
    line-height: 1.5rem; /* 24px */
    font-weight: 400;
    letter-spacing: 0;
  }
</style>
