const { app, BrowserWindow } = require('electron')
const childIpc = require('electron-child-ipc');
const path = require('path');

function createWindow () {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    })
    console.log(childIpc);
    childIpc.createAndRegisterChildProcess('child1', path.join(__dirname, 'child.js'));

    win.loadFile('index.html')
    win.webContents.openDevTools()
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})
