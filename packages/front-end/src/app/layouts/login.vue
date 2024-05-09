<template>
  <EGToasts />

  <div class="grid grid-cols-2">
    <div class="background-image h-screen bg-cover bg-center p-[80px]">
      <div class="flex flex-col">
        <EGLogo class="mr-2 w-[140px]" :white-variant="true" />
        <div
          class="translate-[-50%, -43%] absolute left-[0px%] top-[43%] w-[314px] transform font-serif text-[32px] leading-10 text-white"
          style="font-weight: 200"
        >
          Genomic Insights Made Effortless
        </div>
      </div>
    </div>
    <div class="flex min-h-screen flex-col">
      <div class="flex flex-grow flex-col items-center justify-center"><slot /></div>
      <footer
        class="border-stroke-light flex w-full justify-between gap-5 border-t border-solid px-12 py-6 text-center text-sm leading-5"
      >
        <EGText tag="a" color-class="text-muted" href="tel:+15551234567">Call +1 (555) 123-4567</EGText>
        <EGText tag="a" color-class="text-muted" href="mailto:contact@easygenomics.com">Contact Easy Genomics</EGText>
      </footer>
    </div>
  </div>
</template>

<style scoped lang="scss">
  .background-image {
    background-image: url('/images/bg-login.jpg');
    background-size: cover;
  }
</style>
<script setup lang="ts"></script>
