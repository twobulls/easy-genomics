<script setup lang="ts">
  const chips = ['Simple to use', 'Start small, scale fast', 'Seamless experience', 'Secure data storage'];
</script>

<template>
  <EGToasts />

  <div class="grid grid-cols-2">
    <div class="background-image h-screen bg-cover bg-center p-[80px]">
      <div class="flex h-full flex-col">
        <EGLogo class="mr-2 w-[200px] pb-[140px]" :white-variant="true" />

        <div class="leading-64 max-w-[400px] font-serif text-[46px] font-medium text-white">
          Genomic Insights Made Effortless
        </div>

        <div class="grow"></div>

        <div class="flex flex-row flex-wrap gap-3">
          <div v-for="chip of chips" class="rounded-full bg-[#ffffff33] px-5 py-2 text-2xl font-medium text-white">
            {{ chip }}
          </div>
        </div>
      </div>
    </div>
    <div class="flex min-h-screen flex-col">
      <div class="flex flex-grow flex-col items-center justify-center"><slot /></div>
      <footer
        class="border-stroke-light flex w-full justify-end gap-5 border-t border-solid px-12 py-6 text-center text-sm leading-5"
      >
        <EGText tag="a" color-class="text-muted" href="mailto:contact@easygenomics.com">Contact Easy Genomics</EGText>
      </footer>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .background-image {
    background-image: url('/images/bg-login.svg');
  }
</style>
