/* globals INCLUDE_RESOURCES_PATH */
import { app, ipcMain } from 'electron';
import { config } from 'dotenv';
import { autoUpdater } from 'electron-updater';
config();


ipcMain.on(`setIsSyncing`, (event, isSyncing) => {
  global.isSyncing = isSyncing;
});

let updating = false;

function autoUpdate () {
  if (updating) return;
  updating = true;
  if (global.isSyncing) {
    setTimeout(() => autoUpdate(), 5000);
  } else {
    autoUpdater.quitAndInstall();
  }
  updating = false;
}

autoUpdater.on(`update-downloaded`, () => autoUpdate());
autoUpdater.checkForUpdates();
setInterval(() => {
  autoUpdater.checkForUpdates();
}, 600000);

/**
 * Set `__resources` path to resources files in renderer process
 */
global.__resources = undefined // eslint-disable-line no-underscore-dangle
// noinspection BadExpressionStatementJS
INCLUDE_RESOURCES_PATH // eslint-disable-line no-unused-expressions
if (__resources === undefined) console.error('[Main-process]: Resources path is undefined')

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') app.quit()
})

// Load here all startup windows
require('./mainWindow')
