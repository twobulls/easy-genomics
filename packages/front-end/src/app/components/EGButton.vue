<script setup lang="ts">
  import { cva } from 'class-variance-authority';
  import { ButtonVariantEnum, ButtonVariant, ButtonSizeEnum, ButtonSize } from '~/types/buttons';

  type ButtonProps = {
    variant: ButtonVariant;
    size: ButtonSize;
    label?: string;
  };

  withDefaults(defineProps<ButtonProps>(), {
    variant: ButtonVariantEnum.enum.primary,
    size: ButtonSizeEnum.enum.md,
  });

  const buttonVariants = cva(
    'rounded-lg text-center text-sm shadow-none focus-visible:outline-offset-1 transition-colors duration-200',
    {
      variants: {
        variant: {
          primary: [
            'bg-primary-500',
            'text-white',
            'active:outline-none',
            'active:bg-[#29007F]',
            'disabled:bg-neutral-200',
            'disabled:text-muted',
            'focus-visible:outline-primary-500',
            'hover:bg-primary-dark',
          ],
          secondary: [
            'bg-white',
            'text-body',
            'border',
            'border-neutral-200',
            'active:outline-none',
            'active:bg-transparent',
            'active:border-transparent',
            'focus-visible:outline-primary-500',
            'hover:bg-background-dark-grey',
          ],
          ghost: [
            'bg-transparent',
            'text-body',
            'border-none',
            'active:bg-transparent',
            'active:text-body',
            'active:border-none',
            'active:no-underline',
            'active:outline-none',
            'focus-visible:outline-primary-500',
            'focus-visible:bg-white',
            'focus-visible:border-none',
            'hover:text-primary-500',
            'hover:underline',
            'hover:underline-offset-2',
            'hover:bg-transparent',
          ],
          destructive: [
            'bg-alert-danger-muted',
            'text-alert-danger',
            'active:outline-none',
            'active:bg-[#F6C0BC]',
            'active:text-alert-danger-dark',
            'disabled:bg-neutral-200',
            'disabled:text-zinc-500',
            'focus-visible:outline-alert-danger',
            'hover:bg-red-100',
            'hover:text-alert-danger-dark',
          ],
        },
        size: {
          sm: ['px-6', 'py-3'],
          md: ['px-6 py-4 font-medium'],
          lg: ['p-6 text-base font-semibold'],
        },
      },
      defaultVariants: { variant: ButtonVariantEnum.enum.primary, size: ButtonSizeEnum.enum.md },
    }
  );
</script>

<template>
  <UButton :class="buttonVariants({ variant, size })" :label="label" />
</template>
