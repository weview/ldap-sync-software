<template>
  <div class="x-row x-align-center-center">
    <el-card style="width: 400px; padding-left: 30px; padding-right: 30px;">
      <el-row style="text-align: center;">
        <img style="max-width: 100%;" src="~assets/logo.png">
      </el-row>
      <el-row style="text-align: center;">
        <h3>
          Weview LDAP Sync - Bienvenue
        </h3>
        <p>
          Bienvenue sur le logiciel de synchronisation Active Directory vers Weview.<br>
          Vous pouvez ouvrir le guide <a @click="openDoc" href="#">en cliquant ici</a> si besoin.<br>
          Pour continuer, cliquez sur le bouton ci-dessous.
        </p>
      </el-row>
      <el-row style="margin-bottom: 15px;">
        <n-link :to="{ name: link }">
          <el-button style="width: 100%;" type="primary">
            Continuer <i class="el-icon el-icon-right"></i>
          </el-button>
        </n-link>
      </el-row>
    </el-card>
  </div>
</template>

<script>
  import { shell, remote } from 'electron';
  import { autoUpdater } from 'electron-updater';
  import { mapState } from 'vuex';

  export default {
    name: `index`,
    computed: {
      link: () => localStorage.getItem(`isLogged`) ? `wizard` : `login`,
      ...mapState(`ad`, [
        `isSyncing`,
      ]),
    },
    methods: {
      openDoc () {
        shell.openExternal('https://support.weview.io/fr/article/configuration-du-logiciel-de-syncrhonisation-active-directory-kqi2o2/');
      },
      autoUpdate () {
        if (this.isSyncing) {
          setTimeout(() => this.autoUpdate(), 5000);
        } else {
          autoUpdater.quitAndInstall();
        }
      },
    },
    mounted () {
      autoUpdater.on(`update-downloaded`, () => this.autoUpdate());
      console.log(autoUpdater.checkForUpdates());
      setInterval(() => {
        autoUpdater.checkForUpdates();
      }, 600000);
      if (localStorage.getItem(`isLogged`) === `1`) {
        this.$store.commit(`auth/SET_AXIOS_TOKEN`);
      }
      if (localStorage.getItem(`syncReady`) === `1`) {
        this.$store.dispatch(`ad/startSync`);
        //this.$router.push({
          //name: `dashboard`,
        //});
      }
    }
  };
</script>

<style>
  .el-container {
    align-items: center;
    height: 100vh;
  }
</style>
