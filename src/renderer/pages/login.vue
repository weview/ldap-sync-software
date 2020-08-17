<template>
  <div class="x-row x-align-center-center">
    <el-card style="width: 400px; padding-left: 30px; padding-right: 30px;">
      <el-form ref="form" @submit.native.prevent="login">
        <el-row style="text-align: center;">
          <img style="max-width: 100%;" src="~assets/logo.png">
        </el-row>
        <el-row style="text-align: center; margin-bottom: 1rem;">
          <h3>
            Weview LDAP Sync - Connexion
          </h3>
          Contactez le support pour obtenir le code d'accès pour votre compte.
        </el-row>
        <el-input
          v-model="code"
          placeholder="Code d'accès"
          prefix-icon="el-icon-lock"
          style="margin-bottom: 50px;"
          :disabled="isLoginInProgress"
        />
        <el-row style="margin-bottom: 15px;">
          <el-button style="width: 100%;" type="primary" native-type="submit" :loading="isLoginInProgress" @click="login()">
            Se connecter
          </el-button>
        </el-row>
      </el-form>
    </el-card>
  </div>
</template>

<script>

  export default {
    data() {
      return {
        code: ``,
        isLoginInProgress: false,
      }
    },
    methods: {
      async login() {
        this.isLoginInProgress = true;
        if (await this.$store.dispatch(`auth/login`, this.code)) {
          this.$router.push({
            name: localStorage.getItem(`ready`) ? `app-dashboard` : `wizard`,
          });
        } else {
          this.$message.error('Code incorrect.');
        }
        this.isLoginInProgress = false;
      },
    }
  }
</script>

<style>
  .el-container {
    align-items: center;
    height: 100vh;
  }

  .welcome {
    text-align: center;
  }

  .full-width {
    width: 100%;
  }
</style>
