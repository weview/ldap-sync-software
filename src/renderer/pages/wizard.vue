<template>
  <nuxt-child/>
</template>

<script>
  export default {
    name: `wizard`,
    middleware: `authenticated`,
  }
</script>

<style scoped>

</style>
