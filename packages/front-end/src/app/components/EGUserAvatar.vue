<!-- TODO: update pages and components that use this component to use the new EGUserAvatarNew.vue component - https://dept-au.atlassian.net/browse/EG-504 -->
<script setup lang="ts">
const props = defineProps<{
  name?: string;
  email: string;
  isActive: boolean;
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
  return props.isActive ? 'bg-primary-dark text-white' : 'bg-primary-muted text-primary-dark';
});
</script>

<template>
  <div class="flex h-8 w-8 items-center justify-center rounded-full text-xs font-normal" :class="avatarColour">
    {{ initials }}
  </div>
</template>

<style scoped lang="scss"></style>
