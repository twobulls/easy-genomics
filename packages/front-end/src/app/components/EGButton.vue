<script setup lang="ts">
  import { cva } from 'class-variance-authority';
  import { ButtonVariantEnum, ButtonVariant, ButtonSizeEnum, ButtonSize } from '@FE/types/buttons';

  type ButtonProps = {
    variant?: ButtonVariant;
    size?: ButtonSize;
    label?: string;
    icon?: string;
    iconRight?: boolean;
    disabled?: boolean;
    uButtonType?: string;
    loading?: boolean;
  };

  withDefaults(defineProps<ButtonProps>(), {
    variant: ButtonVariantEnum.enum.primary,
    size: ButtonSizeEnum.enum.md,
    label: '',
    icon: '',
    iconRight: true,
    disabled: false,
    uButtonType: undefined,
    loading: false,
  });

  const buttonVariants = cva(
    'rounded-lg text-center text-sm shadow-none focus-visible:outline-offset-1 transition-colors duration-200 whitespace-nowrap',
    {
      variants: {
        variant: {
          primary: [
            'button-gradient',
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
            'disabled:bg-neutral-200',
            'disabled:text-muted',
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
            'disabled:bg-neutral-200',
            'disabled:text-muted',
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
          xs: ['px-3', 'py-2'],
          sm: ['px-6', 'py-3'],
          md: ['px-6 py-4 font-medium'],
          lg: ['p-6 text-base font-semibold'],
        },
      },
      defaultVariants: { variant: ButtonVariantEnum.enum.primary, size: ButtonSizeEnum.enum.md },
    },
  );
</script>

<template>
  <UButton
    :disabled="disabled"
    :icon="icon"
    :trailing="iconRight"
    :class="buttonVariants({ variant, size })"
    :label="label"
    :ui="{
      base: 'w-fit',
      icon: {
        base: 'flex-shrink-0',
        loading: 'animate-spin',
      },
      default: {
        loadingIcon: 'i-heroicons-arrow-path-20-solid',
      },
    }"
    :type="uButtonType"
    :loading="loading"
  />
</template>

<style scoped lang="scss">
  .button-gradient {
    background-image: linear-gradient(to right, #9266f5, #5524e0);
    background-size: cover;
    background-repeat: no-repeat;
    background-position: 0px 0px;

    transition: background-position 300ms ease-in-out;
  }

  .button-gradient:hover {
    background-position: -250px 0px; /* Note: this will not look right if a button ever gets wider than 250px */
  }
</style>
