export default {
  mutations: {
    SET_AXIOS_TOKEN () {
      this.$api.setToken(localStorage.getItem(`token`));
    },
  },
  actions: {
    async login ({ commit }, code) {
      try {
        const { token } = await this.$api.$post(`/login`, { code });
        localStorage.setItem(`token`, token);
        localStorage.setItem(`isLogged`, `1`);
        commit(`SET_AXIOS_TOKEN`);
        return true;
      } catch (e) {
        return false;
      }
    },
  },
};
