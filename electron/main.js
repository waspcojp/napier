const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("path");

const api = require('./api');

let mainWindow;
const createWindow = () => {
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 1000,
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });
    mainWindow.loadFile("index.html");

    mainWindow.webContents.openDevTools();

    mainWindow.on("closed", () => {
        mainWindow = null;
    });
};

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });

    ipcMain.handle('user:login', api.login);
    ipcMain.handle('user:logout', api.logout);
    ipcMain.handle('user:signup', api.signup);
    ipcMain.handle('user:password', api.password);
    ipcMain.handle('env:set', api.setConf);
    ipcMain.handle('env:get', api.getConf);
    ipcMain.handle('profiles', api.getProfiles);
    ipcMain.handle('profile:update', api.updateProfile);
    ipcMain.handle('profile:delete', api.deleteProfile);
    ipcMain.handle('proxy:start', api.startProxy);
    ipcMain.handle('proxy:stop', api.stopProxy);
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});