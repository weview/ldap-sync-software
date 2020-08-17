import ldap from "ldapjs";
import _ from 'lodash';

function validateEmail (email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(String(email).toLowerCase());
}

let nextSync = null;

export default {
  state: () => ({
    url: ``,
    username: ``,
    password: ``,
    base: ``,
    groups: [],
    ou: [],
    filterGroups: [],
    filterOu: [],
    type: null,
    isSyncing: false,
  }),
  mutations: {
    SET_CREDENTIALS (state, { url, username, password, base }) {
      state.url = url;
      state.username = username;
      state.password = password;
      state.base = base;
    },
    SAVE_CREDENTIALS (state, { url, username, password, base }) {
      localStorage.setItem(`ldapCredentials`, JSON.stringify({ url, username, password, base }));
    },
    LOAD_CREDENTIALS (state) {
      const { url, username, password, base } = JSON.parse(localStorage.getItem(`ldapCredentials`));
      state.url = url;
      state.username = username;
      state.password = password;
      state.base = base;
    },
    SET_GROUPS (state, groups) {
      state.groups = groups;
    },
    SET_OU (state, ou) {
      state.ou = ou;
    },
    SET_SELECTED_GROUPS (state, groups) {
      state.filterGroups = groups;
      localStorage.setItem(`groups`, JSON.stringify(groups));
    },
    SET_SELECTED_OU (state, ou) {
      state.filterOu = ou;
      localStorage.setItem(`ou`, JSON.stringify(ou));
    },
    SET_TYPE (state, type) {
      state.type = type;
      localStorage.setItem(`syncType`, JSON.stringify(type));
    },
    LOAD_GROUPS_AND_OU (state) {
      state.filterGroups = JSON.parse(localStorage.getItem(`groups`));
      state.filterOu = JSON.parse(localStorage.getItem(`ou`));
      state.type = localStorage.getItem(`syncType`);
      console.log(state.filterGroups, state.filterOu, state.type);
    },
    SET_IS_SYNCING (state, isSyncing) {
      state.isSyncing = isSyncing;
    },
  },
  actions: {
    startSync ({ commit, dispatch }) {
      commit(`LOAD_GROUPS_AND_OU`);
      return dispatch(`sync`);
    },
    async sync ({ state, dispatch, commit }) {
      if (state.isSyncing) return;
      commit(`SET_IS_SYNCING`, true);
      try {
        let users = await dispatch(`fetchUsersToSync`, {
          type: state.type,
          groupsOrOu: state.type === `group` ? state.filterGroups : state.filterOu,
        });
        users = users.map(u => ({
          ...u,
          dn: u.dn.replace(/CN=(.*?),/gi, ``),
        }));
        await this.$api.$post(`/sync`, { users });
      } catch (e) {
        console.error(e);
      } finally {
        clearTimeout(nextSync);
        nextSync = setTimeout(() => dispatch(`sync`), 86400000);
        commit(`SET_IS_SYNCING`, false);
      }
    },
    login ({ commit }, { url, username, password, base }) {
      return new Promise((resolve, reject) => {
        const client = ldap.createClient({
          url,
          connectTimeout: 5000,
        });
        client.bind(username, password, function (err) {
          if (err) {
            console.log(err);
            return reject(err);
          } else {
            commit(`SET_CREDENTIALS`, { url, username, password, base });
            commit(`SAVE_CREDENTIALS`, { url, username, password, base });
            resolve(client);
          }
        });
      });
    },
    makeInstance ({ state, dispatch }) {
      dispatch(`loadCredentials`);
      return dispatch(`login`, { url: state.url, username: state.username, password: state.password, base: state.base });
    },
    loadCredentials ({ commit, state }) {
      if (!state.url) {
        commit(`LOAD_CREDENTIALS`);
      }
    },
    search ({ state, dispatch }, { type, dn, includeBase = true, sub = true }) {
      return new Promise(async (resolve, reject) => {
        dispatch(`loadCredentials`);
        const entries = [];
        let baseDN = ``;
        if (dn) {
          baseDN = dn;
          if (includeBase) {
            baseDN += `,`;
          }
        }
        if (includeBase) {
          baseDN += state.base;
        }
        (await dispatch(`makeInstance`)).search(baseDN, {
          scope: sub ? `sub` : `one`,
          filter: `objectClass=${type}`,
        }, function (err, res) {
          if (err) {
            return reject(err);
          }
          res.on(`searchEntry`, function (entry) {
            entries.push(entry.object);
          });
          res.on(`error`, function (err) {
            reject(err);
          });
          res.on(`end`, function () {
            resolve(entries);
          });
        });
      });
    },
    fetchGroups ({ commit, dispatch }) {
      return new Promise(async (resolve, reject) => {
        try {
          const groups = await dispatch(`search`, { type: `group` });
          commit(`SET_GROUPS`, groups);
          resolve();
        } catch (e) {
          console.error(e);
          reject(e);
        }
      });
    },
    fetchOu ({ commit, dispatch }) {
      return new Promise(async (resolve, reject) => {
        try {
          const ou = await dispatch(`search`, { type: `organizationalUnit` });
          commit(`SET_OU`, ou);
          resolve();
        } catch (e) {
          console.error(e);
          reject(e);
        }
      });
    },
    async fetchUsersToSync ({ dispatch }, { type, groupsOrOu }) {
      let users = [];
      if (type === `group`) {
        const groups = _.flatten(await Promise.all(
          groupsOrOu.map(async group => {
            try {
              return await dispatch(`search`, { type: `group`, dn: group, includeBase: false });
            } catch (e) {
              return [];
            }
          })
        ));

        users = _(groups).map(`member`).flatten().uniq().value();
        users = _.flatten(await Promise.all(users.map(u => dispatch(`search`, { type: `user`, dn: u, includeBase: false, sub: true }))));
      } else {
        const selectedOu = groupsOrOu.map(ou => ou[ou.length-1]);
        users = _.flatten(await Promise.all(
          selectedOu.map(async ou => {
            try {
              return await dispatch(`search`, { type: `user`, dn: ou, includeBase: false, sub: false });
            } catch (e) {
              return [];
            }
          })
        ));
      }
      return users.filter(u => u).map(u => ({
        dn: u.dn,
        firstname: u.givenName,
        lastname: u.sn,
        email: u.mail || (validateEmail(u.userPrincipalName) ? u.userPrincipalName : null),
      }));
    },
  },
};
