<template>
  <el-container>
    <el-main>
      <div class="x-row x-align-center-center">
        <el-card style="width: 400px; padding-left: 30px; padding-right: 30px;">
          <slot></slot>
          <nuxt />
        </el-card>
      </div>
    </el-main>
  </el-container>
</template>

<script>
  export default {
    name: `SmallCard`,
  };
</script>

<style>
body {
  margin: 0 !important;
}
</style>
