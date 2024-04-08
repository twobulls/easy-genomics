<script setup lang="ts">
  const { hasAuth } = useAuth();
  onMounted(async () => {
    console.log(await hasAuth());
  });
</script>

<template>
  <H1>Heading 1</H1>
  <H2 class="lifeline-dark-blue-100 lifeline-dark-blue">Heading 2</H2>
  <H3>Heading 3</H3>
  <H4>Heading 4</H4>
  <H5>Heading 5</H5>
</template>

<style scoped></style>
