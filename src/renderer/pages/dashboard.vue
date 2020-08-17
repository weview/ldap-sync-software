<template>
  <small-card>
    <el-row style="text-align: center; margin-bottom: 1rem;">
      <h3>
        État de la synchronisation des utilisateurs
      </h3>
    </el-row>

    <el-row style="margin-bottom: 15px;">
      <n-link :to="{ name: `wizard-selectou` }">
        <el-button style="width: 100%;" type="primary" icon="fa fa-edit">
          Modifier la sélection des utilisateurs
        </el-button>
      </n-link>
    </el-row>
    <el-row>
      <el-button style="width: 100%;" type="default" icon="far fa-minus-square" @click="minimize()">
        Réduire l'application
      </el-button>
    </el-row>
  </small-card>
</template>

<script>
import SmallCard from '@/layouts/SmallCard';
import { remote } from 'electron';

export default {
  name: `dashboard`,
  components: {
    SmallCard,
  },
  methods: {
    minimize () {
      remote.BrowserWindow.getFocusedWindow().minimize();
    },
  },
};
</script>

<style scoped>

</style>
