/* eslint global-require: off, no-console: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `yarn build` or `yarn build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
require('core-js/stable');
require('regenerator-runtime/runtime');
const {
  app,
  ipcMain,
  BrowserWindow,
  Notification,
  Tray,
  Menu,
  shell,
} = require('electron');
// const checkDiskSpace = require('check-disk-space').default;
const fs = require('fs');
const { URL } = require('url');
const path = require('path');
const { dialog } = require('electron');
const firstRun = require('electron-first-run')();

let resolveHtmlPath;
let force_quit = false;

if (process.env.NODE_ENV === 'development') {
  const port = process.env.PORT || 1213;
  resolveHtmlPath = function (htmlFileName) {
    const url = new URL(`http://localhost:${port}`);
    url.pathname = htmlFileName;
    return url.href;
  };
} else {
  resolveHtmlPath = function (htmlFileName) {
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  };
}

let mainWindow = null;
let domain = '';

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async function () {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async function () {
  if (
    process.env.NODE_ENV === 'development' ||
    process.env.DEBUG_PROD === 'true'
  ) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? process.resourcesPath + '/assets'
    : __dirname + '/../../assets';

  const getAssetPath = function (...paths) {
    return RESOURCES_PATH + '/' + paths[0];
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.ico'),
    // autoHideMenuBar: true,
    webPreferences: {
      // devTools: false,
      webviewTag: true,
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      // preload: __dirname + '/preload.js',
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));
  // mainWindow.setAudioMuted(true);

  if (firstRun) {
    shell.openPath(getAssetPath('ssl/client.p12'));
  }

  mainWindow.webContents.on('did-finish-load', function () {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.maximize();
      mainWindow.show();
      mainWindow.focus();
    }
  });

  ipcMain.on('asynchronous-message-channel', (event, arg) => {
    console.log('4713033 main.js');
  });

  ipcMain.on('download-url', async function (event, url, d) {
    domain = d;
    mainWindow.webContents.downloadURL(url);
  });

  mainWindow.webContents.on('will-prevent-unload', (event) => {
    console.log('11111');
    console.log(mainWindow.webContents.url);
    const choice = dialog.showMessageBoxSync(mainWindow, {
      type: 'question',
      buttons: ['Leave', 'Stay'],
      title: 'Do you want to leave this site?',
      message: 'Changes you made may not be saved.',
      defaultId: 0,
      cancelId: 1,
    });
    const leave = choice === 0;
    if (leave) {
      event.preventDefault();
    }
  });

  mainWindow.webContents.session.on(
    'will-download',
    function (event, item, webContents) {
      // check if child browser window is authorized
      if (item.getURL().includes('redir=')) {
        event.preventDefault();
        let childWindow = new BrowserWindow({
          show: false,
          width: 1024,
          height: 728,
          icon: getAssetPath('icon.ico'),
          title: 'Auth check',
          webPreferences: {
            devTools: false,
          },
        });
        childWindow.loadURL(`https://${domain}.discord.com`);
        childWindow.removeMenu();
        childWindow.show();
        childWindow.focus();

        childWindow.webContents.on('will-redirect', function (event, url) {
          console.log(20230213, 'webContents   ->   will-redirect', event);
          console.log(20230213, 'webContents   ->   will-redirect', url);

          if (url.includes('discord.com/ssb/redirect')) {
            event.preventDefault();
            const reUrl = url.replace('ssb/redirect', '');
            childWindow.loadURL(reUrl);
          }
        });
        childWindow.webContents.on('new-window', function (event) {
          console.log(555, 'webContents   ->   new-window');

          event.preventDefault();
        });

        mainWindow.webContents.send(
          'download-file-message',
          'Security issue!',
          `Please check Auth to download file.<br/>You could close the child window after sign in.`,
          'info'
        );
        return;
      }

      // try download
      const tmpSavedPath = item.getSavePath();
      let receivedBytes = 0;
      const totalBytes = item.getTotalBytes();

      if (totalBytes > 1e8) {
        mainWindow.webContents.send(
          'download-file-message',
          'Oops!',
          `Downloading file has been rejected. file size is too large. it must be less than 100 MB.`,
          'error'
        );
        item.cancel();
        return false;
      }
      //  else {
      //   // check disk space
      //   checkDiskSpace(tmpSavedPath).then(function (folderInfo) {
      //     if (folderInfo.free < totalBytes) {
      //       mainWindow.webContents.send(
      //         'download-file-message',
      //         'Error',
      //         `Disk space is not enough. You can't download the file.`,
      //         'error'
      //       );
      //       item.cancel();
      //       return false;
      //     }
      //   });
      // }

      item.on('updated', function (event, state) {
        console.log(555, 'webContents   ->   item   ->   updated');

        if (state === 'interrupted') {
          mainWindow.webContents.send(
            'download-file-message',
            'Oops!',
            `Download is interrupted but can be resumed.`,
            'error'
          );
        } else if (state === 'progressing') {
          if (item.isPaused()) {
            mainWindow.webContents.send(
              'download-file-message',
              'Downloading File',
              `Download is paused.`,
              'info'
            );
          } else {
            receivedBytes = item.getReceivedBytes();
            if (receivedBytes > 1e8) {
              mainWindow.webContents.send(
                'download-file-message',
                'Oops!',
                `Downloading file has been rejected. file size is too large.`,
                'error'
              );
              item.cancel();
              return false;
            }
          }
        }
      });
      item.once('done', async function (event, state) {
        console.log(555, 'webContents   ->   item   ->   done');

        if (state === 'completed') {
          // must be sent to the server for backup...
          const fileName = item.getFilename();
          const url = item.getURL();
          const fileMime = item.getMimeType();

          const tmpSavedPath = item.getSavePath();
          const totalBytes = item.getTotalBytes();

          try {
            // const fileContent = this.electronService.fs.readFileSync(tmpSavedPath, { encoding: 'base64' });
            const fileContent = fs.readFileSync(tmpSavedPath, {
              encoding: 'base64',
            });
            const base64FileContent = `data:${fileMime};base64,${fileContent}`;

            const date = new Date(new Date().getTime() + 9 * 3600 * 1000);
            const s_y = date.getUTCFullYear() - 2000;
            const s_m = `0${date.getUTCMonth() + 1}`.slice(-2);
            const s_d = `0${date.getUTCDate()}`.slice(-2);
            const s_hh = `0${date.getUTCHours()}`.slice(-2);
            const s_mm = `0${date.getUTCMinutes()}`.slice(-2);
            const sendTime = `${s_y}${s_m}${s_d}_${s_hh}${s_mm}`;
            const realFileName = `${sendTime}-${fileName}`;

            const data = {
              fileName: realFileName,
              base64FileContent: base64FileContent,
              transferType: 2,
            };
            mainWindow.webContents.send('download-file-backup', data);
          } catch (e) {
            mainWindow.webContents.send(
              'download-file-message',
              'Oops!',
              `Downloading file has been faild. please retry it.`,
              'error'
            );
            try {
              if (fs.existsSync(tmpSavedPath)) {
                fs.unlinkSync(tmpSavedPath);
              }
            } catch (e) {
              console.log('cannot remove temp file');
            }
          }
        } else {
          mainWindow.webContents.send(
            'download-file-message',
            'Oops!',
            `Download failed: ${state}`,
            'error'
          );
        }
      });
    }
  );

  // media service
  ipcMain.on('check-call-window-closed', async (event) => {
    console.log(555, 'ipcMain   ->   heck-call-window-closed');
    if (BrowserWindow.getAllWindows().length === 1) {
      event.reply('stop-call');
    }
  });

  ipcMain.on('close-call-window', () => {
    console.log(555, 'ipcMain   ->   close-call-window');

    BrowserWindow.getAllWindows().forEach((win) => {
      if (win.id > 1) {
        win.close();
      }
    });
  });

  ipcMain.on('run-as-tray', function (event, url) {
    console.log(555, 'ipcMain   ->   run-as-tray');

    let trayWindow = new BrowserWindow({
      // show: false,
      webPreferences: {
        devTools: false,
      },
    });
    trayWindow.loadURL(url);
  });

  ipcMain.on('reload', function () {
    console.log(555, 'ipcMain   ->   reload');

    mainWindow.webContents.reload();
  });

  mainWindow.on('closed', function () {
    console.log(555, 'ipcMain   ->   closed');

    mainWindow = null;
  });

  mainWindow.on('close', function (event) {
    console.log(555, 'ipcMain   ->   close');

    if (!force_quit) {
      event.preventDefault();
      mainWindow.hide();
    }
  });

  var trayIcon = new Tray(getAssetPath('icon.ico'));
  trayIcon.setToolTip(`Discord (active)`);

  trayIcon.on('click', function () {
    console.log(555, 'tryIcon   ->   click');

    mainWindow.maximize();
    mainWindow.show();
  });

  var contextMenu = Menu.buildFromTemplate([
    {
      label: 'Show App',
      click: function () {
        mainWindow.maximize();
        mainWindow.show();
      },
    },
    {
      label: 'Quit',
      click: function () {
        force_quit = true;
        app.quit();
      },
    },
  ]);

  trayIcon.setContextMenu(contextMenu);

  ipcMain.on('set-window-title', function (event, team) {
    mainWindow.setTitle(`Discord - ${team}`);
    trayIcon.setToolTip(`Discord - ${team}`);
    app.setAppUserModelId(`Discord - ${team}`);
  });

  app.on(
    'certificate-error',
    function (event, webContents, url, error, certificate, callback) {
      callback(true);
    }
  );

  setTimeout(function () {
    app.on('login', function (event, webContents, request, authInfo, callback) {
      event.preventDefault();
    });
  }, 100);
};

try {
  if (process.platform === 'win32') {
    app.setAppUserModelId('Discord notification');
  }

  app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.whenReady().then(createWindow).catch(console.log);

  app.on('activate', function () {
    if (mainWindow === null) createWindow();
  });
} catch (e) {
  console.log(e);
  throw e;
}
