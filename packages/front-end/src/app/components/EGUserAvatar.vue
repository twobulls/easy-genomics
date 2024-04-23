<script setup lang="ts">
  const props = defineProps<{
    name?: string;
    email: string;
    labManager: boolean;
    labTechnician: boolean;
  }>();

  const initials = computed(() => {
    if (!props.name) {
      return props.email[0].toUpperCase();
    }
    return props.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  });

  const avatarColour = computed(() => {
    if (!props.name && props.email) {
      return 'bg-primary-muted text-primary-dark';
    } else {
      return props.labManager
        ? 'bg-alert-success-dark text-white'
        : props.labTechnician
          ? 'bg-primary-500 text-white'
          : ' text-white bg-text-muted';
    }
  });
</script>

<template>
  <div class="flex h-10 w-10 items-center justify-center rounded-full text-xs font-normal" :class="avatarColour">
    {{ initials }}
  </div>
</template>

<style scoped lang="scss"></style>
