<script setup lang="ts">
  /**
   * Renders different HTML tags based on the provided tag prop.
   * It can render headings from h1 to h6, paragraph, div, and span, each with specific styles defined in the style section.
   * Specifies a color class to use for the element being rendered.
   */
  defineProps({
    colorClass: {
      default: 'text-body',
      type: String,
    },
    href: {
      type: String,
    },
    small: {
      type: Boolean,
    },
    tag: {
      type: [String],
      validator: (tag: string) => ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'a', 'small'].includes(tag),
    },
  });
</script>

<template>
  <component
    :href="href"
    :is="tag"
    :class="[
      `${colorClass}`,
      ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(<string>tag) ? `text-heading font-serif` : '',
      ['a'].includes(<string>tag) ? `hover:underline` : '',
    ]"
  >
    <slot />
  </component>
</template>

<style scoped lang="scss">
  @use '@/styles/helpers';

  h1,
  h2 {
    font-weight: 600;
  }
  h1 {
    font-size: toRem(36px);
    line-height: toRem(42px);
    font-style: normal;

    > p {
      margin-bottom: toRem(30px);
    }
  }
  h2 {
    font-size: toRem(36px);
    line-height: toRem(44px);
  }
  h3 {
    font-size: toRem(24px);
    line-height: toRem(32px);
  }
  h4 {
    font-size: toRem(18px);
    line-height: toRem(22px);
  }
  h5 {
    font-size: toRem(14px);
    line-height: toRem(20px);
  }
  h3,
  h4,
  h5 {
    font-weight: 500;
    letter-spacing: toRem(-0.14px);

    > p {
      margin-bottom: 1.2rem;
    }
  }

  a,
  p,
  div,
  span {
    line-height: toRem(24px);
    font-weight: 400;
    letter-spacing: 0;
  }

  small {
    font-weight: 400;
    line-height: toRem(16px);
    letter-spacing: 0.2px;
  }
</style>
