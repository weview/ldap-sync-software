<template>
  <small-card>
    <div style="text-align: center; margin-bottom: 3rem;">
      <el-row style="margin-bottom: 1rem;">
        <h3>
          Sélectionnez les groupes ou unités d'organisations
        </h3>
      </el-row>
      <el-row style="margin-bottom: 1rem;">
        <span>Comment sélectionner les utilisateurs ?</span>
      </el-row>
      <el-row>
        <el-radio-group v-model="selectedType" :disabled="inProgress">
          <el-radio-button label="group">Par groupe</el-radio-button>
          <el-radio-button label="organizationalUnit">Par unité d'organisation</el-radio-button>
        </el-radio-group>
      </el-row>
    </div>
    <el-row v-if="selectedType === `group`">
      <el-select
        v-model="selectedGroups"
        filterable
        multiple
        placeholder="Sélectionnez les groupes"
        style="width: 100%; margin-bottom: 3rem;"
        :disabled="inProgress"
      >
        <el-option
          v-for="group in adGroups"
          :key="group.value"
          :label="group.label"
          :value="group.value">
        </el-option>
      </el-select>
    </el-row>
    <el-row v-else-if="selectedType === `organizationalUnit`">
      <el-cascader
        style="width: 100%; margin-bottom: 3rem;"
        placeholder="Sélectionnez les UOs"
        :disabled="inProgress"
        multiple
        checkStrictly
        v-model="selectedOu"
        :options="adOu"
        :props="{ multiple: true, checkStrictly: true }"
        clearable></el-cascader>
    </el-row>
    <el-row style="margin-bottom: 15px;">
      <el-button style="width: 100%;" type="primary" native-type="submit" :loading="inProgress" :disabled="!fieldsOk" @click="startSync()" icon="fa fa-sync">
        Commencer la synchronisation
      </el-button>
    </el-row>
  </small-card>
</template>

<script>
  import SmallCard from '@/layouts/SmallCard';
  import { mapState } from 'vuex';
  import _ from 'lodash';

  export default {
    name: `selectou`,
    components: {
      SmallCard,
    },
    data: () => ({
      selectedType: null,
      group: null,
      inProgress: false,
      selectedGroups: [],
      selectedOu: [],
    }),
    computed: {
      adGroups () {
        return this.groups.map(group => ({
          label: group.cn,
          value: group.dn,
        }));
      },
      ...mapState(`ad`, [
        `groups`,
        `ou`,
        `filterGroups`,
        `filterOu`,
        `base`,
        `type`,
      ]),
      adOu () {
        const ou = this.ou.map(anOu => {
          const length = anOu.ou.length + 4;
          const parent = anOu.dn.substring(length);
          return {
            label: anOu.ou,
            value: anOu.dn,
            parent,
          };
        });

        const finalOuList = ou.filter(anOu => {
          return !anOu.parent.includes(`OU=`) || _.camelCase(anOu.parent) === _.camelCase(this.base);
        });

        this.setChildren(finalOuList, ou);

        return finalOuList;
      },
      fieldsOk () {
        return (this.selectedType === `group` && this.selectedGroups.length > 0)
          || (this.selectedType === `organizationalUnit` && this.selectedOu.length > 0);
      },
    },
    async mounted () {
      this.inProgress = true;
      await Promise.all([
        this.$store.dispatch(`ad/fetchGroups`),
        this.$store.dispatch(`ad/fetchOu`),
      ]);
      this.selectedOu = this.filterOu;
      this.selectedGroups = this.filterGroups;
      this.selectedType = this.type;
      this.inProgress = false;
    },
    methods: {
      setChildren (baseList, allOu) {
        baseList.forEach(parentOu => {
          parentOu.children = allOu.filter(anOu => anOu.parent === parentOu.value);
          if (parentOu.children.length) {
            this.setChildren(parentOu.children, allOu);
          } else {
            delete parentOu.children;
          }
        });
      },
      async startSync () {
        this.inProgress = true;
        let users = await this.$store.dispatch(`ad/fetchUsersToSync`, {
          type: this.selectedType,
          groupsOrOu: this.selectedType === `group` ? this.selectedGroups : this.selectedOu,
        });
        this.inProgress = false;
        try {
          await this.$confirm(`Vous allez synchroniser ${users.length} utilisateur${users.length === 1 ? `` : `s`}, voulez-vous continuer ?`, {
            confirmButtonText: `Continuer`,
            cancelButtonText: `Annuler`,
            type: `info`,
          });
        } catch (e) {
          return;
        }

        this.$store.commit(`ad/SET_SELECTED_GROUPS`, this.selectedGroups);
        this.$store.commit(`ad/SET_SELECTED_OU`, this.selectedOu);
        this.$store.commit(`ad/SET_TYPE`, this.selectedType);
        localStorage.setItem(`syncReady`, `1`);
        this.$store.dispatch(`ad/sync`);
        this.$router.push({
          name: `dashboard`,
        });
      },
    },
  };
</script>

<style scoped>

</style>
