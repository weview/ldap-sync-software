const ICONS_DIR = 'build/icons/'

const windowsOS = {
  win: {
    icon: ICONS_DIR + 'icon.png',
    publisherName: 'weview',
    target: 'squirrel'
  },

  nsis: {
    differentialPackage: true
  }
}

const linuxOS = {
  linux: {
    icon: ICONS_DIR,
    target: 'deb'
  }
}

const macOS = {
  mac: {
    target: 'dmg',
    icon: ICONS_DIR + 'con.icns'
  },
  dmg: {
    contents: [
      {
        x: 410,
        y: 150,
        type: 'link',
        path: '/Applications'
      },
      {
        x: 130,
        y: 150,
        type: 'file'
      }
    ]
  }
}

module.exports = {
  squirrelWindows: {
    iconUrl: `https://resources.weview.io/ldap/icon.ico`,
  },
  asar: false,
  productName: 'Weview Sync Tool',
  appId: 'io.weview.sync',
  artifactName: 'weview-sync-tool.${ext}',
  directories: {
    output: 'build'
  },
  // default files: https://www.electron.build/configuration/contents
  files: [
    'package.json',
    {
      from: 'dist/main/',
      to: 'dist/main/'
    },
    {
      from: 'dist/renderer',
      to: 'dist/renderer/'
    },
    {
      from: 'src/resources/',
      to: 'dist/resources/'
    }
  ],
  ...windowsOS,
  ...linuxOS,
  ...macOS,
}
