<script setup lang="ts">
  const $route = useRoute();
  const $router = useRouter();

  onMounted(() => {
    if ($route.path !== '/labs') {
      $router.push('/labs');
    }
  });
</script>
