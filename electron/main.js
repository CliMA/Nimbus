// const { app, BrowserWindow, ipcMain } = require('electron');
// const { channels } = require('../src/shared/constants');
// const isDev = require('electron-is-dev');   
// const path = require('path');
 
// let mainWindow;
 
// function createWindow() {
//   mainWindow = new BrowserWindow({
//       width: 1920,
//       height: 1080,
//       show: false,
//       webPreferences: {
//         preload: path.join(__dirname, 'preload.js'),
//       }
//   });
//   const startURL = isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`;

//   mainWindow.loadURL(startURL);

//   mainWindow.once('ready-to-show', () => mainWindow.show());
//   mainWindow.on('closed', () => {
//     mainWindow = null;
//   });
// }

// app.on('ready', createWindow);

// ipcMain.on(channels.APP_INFO, (event) => {
//   event.sender.send(channels.APP_INFO, {
//     appName: app.getName(),
//     appVersion: app.getVersion(),
//   });
// });

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const url = require('url');
const { channels } = require('../src/shared/constants');

let mainWindow;

function createWindow () {
  const startUrl = process.env.ELECTRON_START_URL || url.format({
    pathname: path.join(__dirname, '../index.html'),
    protocol: 'file:',
    slashes: true,
  });
  mainWindow = new BrowserWindow({
    width: 1920,
    height: 1080,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  mainWindow.loadURL(startUrl);
  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on(channels.APP_INFO, (event) => {
  event.sender.send(channels.APP_INFO, { 
    appName: app.getName(),
    appVersion: app.getVersion(),
  });
});



