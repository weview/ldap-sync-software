<template>
  <small-card>
    <el-row style="text-align: center; margin-bottom: 1rem;">
      <h3>
        Connectez-vous au serveur Active Directory
      </h3>
    </el-row>

    <el-input
      v-model="url"
      placeholder="Adresse du serveur ldap://..."
      prefix-icon="fa fa-server"
      style="margin-bottom: 30px;"
      :disabled="isLoginInProgress"
    />
    <el-input
      v-model="username"
      placeholder="Utilisateur"
      prefix-icon="fa fa-user"
      style="margin-bottom: 30px;"
      :disabled="isLoginInProgress"
    />
    <el-input
      v-model="password"
      type="password"
      placeholder="Mot de passe"
      prefix-icon="fa fa-lock"
      style="margin-bottom: 30px;"
      :disabled="isLoginInProgress"
    />
    <el-input
      v-model="base"
      placeholder="DN de base (ex: dc=weview,dc=io)"
      prefix-icon="fa fa-search"
      style="margin-bottom: 30px;"
      :disabled="isLoginInProgress"
    />
    <el-row style="margin-bottom: 15px;">
      <el-button style="width: 100%;" type="primary" native-type="submit" :loading="isLoginInProgress" :disabled="!fieldsOk" @click="login()" icon="fa fa-key">
        Se connecter
      </el-button>
    </el-row>
  </small-card>
</template>

<script>
  import SmallCard from '@/layouts/SmallCard';

  export default {
    name: `wizard`,
    components: {
      SmallCard,
    },
    data: () => ({
      users: [],
      username: ``,
      password: ``,
      url: ``,
      base: ``,
      isLoginInProgress: false,
      errorsCount: 0,
    }),
    computed: {
      fieldsOk () {
        return Boolean(this.url) && Boolean(this.username) && Boolean(this.password);
      },
    },
    methods: {
      async login () {
        this.isLoginInProgress = true;
        if (!this.url.startsWith(`ldap://`) && !this.url.startsWith(`ldaps://`)) {
          this.url = `ldap://${this.url}`;
        }
        try {
          await this.$store.dispatch(`ad/login`, {
            url: this.url,
            username: this.username,
            password: this.password,
            base: this.base,
          });
          await this.$store.dispatch(`ad/search`, { type: `organizationalUnit` });
          this.$router.push({
            name: `wizard-selectou`,
          });
        } catch (e) {
          if (e.stack.includes(`0000202B`) || e.stack.includes(`0000208D`)) {
            this.$message.error(`Le DN de base est incorrect.`);
          } else {
            this.$message.error(`URL ou identifiants incorrects.`);
          }
          this.errorsCount++;
          if (this.errorsCount === 5) {
            window.$crisp.push(["do", "message:show", ["text", "Bonjour, des problèmes pour vous connecter à votre serveur AD ? Nous sommes là pour vous aider !"]]);
          }
        }
        this.isLoginInProgress = false;
      },
    },
  };
</script>

<style scoped>

</style>
