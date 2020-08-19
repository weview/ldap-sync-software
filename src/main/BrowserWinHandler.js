import { EventEmitter } from 'events'
import { BrowserWindow, app } from 'electron'
import * as Splashscreen from "@trodi/electron-splashscreen";
import { resolve } from 'path';
import AutoLaunch from 'auto-launch';
import { autoUpdater } from 'electron-updater';
const isProduction = process.env.NODE_ENV === 'production'

export default class BrowserWinHandler {
  /**
     * @param [options] {object} - browser window options
     * @param [allowRecreate] {boolean}
     */
  constructor (options, allowRecreate = true) {
    this._eventEmitter = new EventEmitter()
    this.allowRecreate = allowRecreate
    this.options = options
    this.browserWindow = null
    this.updating = false
    this._createInstance()
  }

  _createInstance () {
    // This method will be called when Electron has finished
    // initialization and is ready to create browser windows.
    // Some APIs can only be used after this event occurs.
    app.on('ready', () => {
      this._create()
    })

    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (!this.allowRecreate) return
    app.on('activate', () => this._recreate())
  }

  _create () {
    const windowOptions = {
      ...this.options,
      webPreferences: {
        ...this.options.webPreferences,
        webSecurity: isProduction, // disable on dev to allow loading local resources
        nodeIntegration: true, // allow loading modules via the require () function
        devTools: !process.env.SPECTRON // disable on e2e test environment
      },
      frame: false,
      resizable: false,
      icon: resolve(__dirname, `../resources/icon.png`),
    };
    if (isProduction) {
      const config = {
        windowOpts: windowOptions,
        templateUrl: resolve(__dirname, `../resources/splash.html`),
        splashScreenOpts: {
          width: 425,
          height: 325,
        },
        frame: false,
        resizable: false,
      };
      this.browserWindow = Splashscreen.initSplashScreen(config);
      this.setAutoUpdate();
      this.setAutoStart();
    } else {
        this.browserWindow = new BrowserWindow(windowOptions);
    }
    this.browserWindow.onbeforeunload = (e) => {
      e.returnValue = false;
      this.browserWindow.getFocusedWindow().minimize();
    };
    this.browserWindow.on('closed', () => {
      // Dereference the window object
      this.browserWindow = null
    })
    this._eventEmitter.emit('created')
  }

  async setAutoStart () {
    const launcher = new AutoLaunch({
      name: `Weview LDAP Sync Tool`,
      path: app.getPath(`exe`),
    });
    if (!await launcher.isEnabled()) {
      launcher.enable();
    }
  }

  autoUpdate () {
    if (this.updating) return;
    this.updating = true;
    if (global.isSyncing) {
      setTimeout(() => this.autoUpdate(), 5000);
    } else {
      try {
        autoUpdater.quitAndInstall();
      } catch (e) {}
    }
    this.updating = false;
  }

  setAutoUpdate () {
    autoUpdater.on(`update-downloaded`, () => this.autoUpdate());
    setInterval(() => {
      autoUpdater.checkForUpdates();
    }, 600000);
  }

  _recreate () {
    if (this.browserWindow === null) this._create()
  }

  /**
     * @callback onReadyCallback
     * @param {BrowserWindow}
     */

  /**
     *
     * @param callback {onReadyCallback}
     */
  onCreated (callback) {
    this._eventEmitter.once('created', () => {
      callback(this.browserWindow)
    })
  }

  /**
     *
     * @returns {Promise<BrowserWindow>}
     */
  created () {
    return new Promise(resolve => {
      this._eventEmitter.once('created', () => {
        resolve(this.browserWindow)
      })
    })
  }
}
