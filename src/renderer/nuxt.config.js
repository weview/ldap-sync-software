/**
 * By default, Nuxt.js is configured to cover most use cases.
 * This default configuration can be overwritten in this file
 * @link {https://nuxtjs.org/guide/configuration/}
 */


module.exports = {
  mode: 'spa', // or 'universal'
  head: {
    title: 'Weview LDAP Sync tool',
  },
  loading: false,
  plugins: [
    {ssr: true, src: '@/plugins/icons.js'},
    {ssr: true, src: '@/plugins/element.js'},
    {ssr: true, src: '@/plugins/crisp.js'},
    '@/plugins/axios',
  ],
  buildModules: [
    '@nuxtjs/dotenv',
  ],
  modules: [
    '@nuxtjs/axios',
  ],
  css: [
    { src: '~/css/main.scss', lang: 'scss'}
  ],
};
