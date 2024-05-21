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
    return !props.name && props.email ? 'bg-primary-muted text-primary-dark' : 'bg-primary-dark text-white';
  });
</script>

<template>
  <div class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-normal" :class="avatarColour">
    {{ initials }}
  </div>
</template>

<style scoped lang="scss"></style>
