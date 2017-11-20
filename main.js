const electron = require('electron')
// Module to control application life.
const app = electron.app
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')
const ipcMain = electron.ipcMain
const shell = electron.shell
const glob = require('glob')
const cp = require('child_process')

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

loadJS()

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 1200, minWidth: 720, height: 600, show: false})

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })

  mainWindow.once('ready-to-show', function() {
        mainWindow.show()
        //主进程发送消息给渲染进程
        mainWindow.webContents.send('ready', 'main-process-ready show')
  })


}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
 
ipcMain.on('loadurl-message', function(event, arg) {
    if(arg) {
      shell.openExternal(arg);
    }
    
})
ipcMain.on('Home', function(event, arg) {
    require(path.join(__dirname, 'main-process/menus/application-menu.js'))();
    mainWindow.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))

    
})

function loadJS () {
  var files = glob.sync(path.join(__dirname, 'main-process/**/*.js'))
  files.forEach(function (file) {
    require(file)
  })
}

var handleSquirrelEvent = function() {
  if (process.platform != 'win32') {
    return false;
  }

  function executeSquirrelCommand(args, done) {
    var updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
    var child = cp.spawn(updateDotExe, args, { detached: true});
    child.on('close', function(code) {
      done();
    });
  }

  function install(done) {
    var target = path.basename(process.execPath);
    executeSquirrelCommand(['--createShortcut', target], done);
  }

  function uninstall(done) {
    var target = path.basename(process.execPath);
    executeSquirrelCommand(['--removeShortcut', target], done);
  }

  var squirrelEvent = process.argv[1];
  switch(squirrelEvent) {
    case '--squirrel-install':
      install(app.quit);
      return true;
    case '--squirrel-updated':
      install(app.quit);
      return true;
    case '--squirrel-obsolete':
      app.quit();
      return true;
    case '--squirrel-uninstall':
      uninstall(app.quit);
      return true;
  }

  return false;
}

if(handleSquirrelEvent()) {
  return;
}