const isDev = require('electron-is-dev')
const dialog = require('electron').dialog
const { app, BrowserWindow, ipcMain } = require('electron')

let win;

function createWindow () {
  win = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    maxWidth: 800,
    maxHeight: 600,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    }
  })

  if (isDev) {
    win.webContents.openDevTools()
  }
  
  ipcMain.on('open-file-dialog', function (event) {
    dialog.showOpenDialog({
      properties: ['openFile', 'openDirectory']
    }, function (files) {
      if (files) event.sender.send('selected-directory', files)
    })
  })


  if (isDev) {
    win.loadURL('http://localhost:8000/')
  } else {
    win.loadFile('dist/index.html')
  }

  win.on('closed', function() {
    // 解除窗口对象的引用，通常而言如果应用支持多个窗口的话，你会在一个数组里
    // 存放窗口对象，在窗口关闭的时候应当删除相应的元素。
    win = null;
    app.quit();
  });
}

app.on('ready', createWindow);

// app.on('window-all-closed', function() {
//   // 对于OS X系统，应用和相应的菜单栏会一直激活直到用户通过Cmd + Q显式退出
//   if (process.platform !== 'darwin') {
//     app.quit();
//   }
// });

// app.on('activate', function() {
//   // 对于OS X系统，当dock图标被点击后会重新创建一个app窗口，并且不会有其他
//   // 窗口打开
//   if (win === null) {
//     createWindow();
//   }
// });