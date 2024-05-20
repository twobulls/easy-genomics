<script setup lang="ts">
  const props = defineProps<{
    name?: string;
    email: string;
    labManager?: boolean;
    labTechnician?: boolean;
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
      return 'bg-primary-dark text-white';
    }
  });
</script>

<template>
  <div class="flex h-10 w-10 items-center justify-center rounded-full text-xs font-normal" :class="avatarColour">
    {{ initials }}
  </div>
</template>

<style scoped lang="scss"></style>
