const electron = require('electron')
const BrowserWindow = electron.BrowserWindow
const Menu = electron.Menu
const app = electron.app
const path = require('path')
const ipcMain = electron.ipcMain

var state = 'no-update';
var download = null;

var win = BrowserWindow.getFocusedWindow();

let template = [{
  label: '编辑',
  submenu: [{
    label: '撤销',
    accelerator: 'CmdOrCtrl+Z',
    role: 'undo'
  }, {
    label: '重做',
    accelerator: 'Shift+CmdOrCtrl+Z',
    role: 'redo'
  }, {
    type: 'separator'
  }, {
    label: '剪切',
    accelerator: 'CmdOrCtrl+X',
    role: 'cut'
  }, {
    label: '复制',
    accelerator: 'CmdOrCtrl+C',
    role: 'copy'
  }, {
    label: '粘贴',
    accelerator: 'CmdOrCtrl+V',
    role: 'paste'
  }, {
    label: '全选',
    accelerator: 'CmdOrCtrl+A',
    role: 'selectall'
  }]
}, {
  label: '查看',
  submenu: [{
    label: '重载',
    accelerator: 'CmdOrCtrl+R',
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        // 重载之后, 刷新并关闭所有的次要窗体
        if (focusedWindow.id === 1) {
          BrowserWindow.getAllWindows().forEach(function (win) {
            if (win.id > 1) {
              win.close()
            }
          })
        }
        focusedWindow.reload()
      }
    }
  }, {
    label: '切换全屏',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Ctrl+Command+F'
      } else {
        return 'F11'
      }
    })(),
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
      }
    }
  }, {
    label: '切换开发者工具',
    accelerator: (function () {
      if (process.platform === 'darwin') {
        return 'Alt+Command+I'
      } else {
        return 'Ctrl+Shift+I'
      }
    })(),
    click: function (item, focusedWindow) {
      if (focusedWindow) {
        focusedWindow.toggleDevTools()
      }
    }
  }]
}, {
  label: '窗口',
  role: 'window',
  submenu: [{
    label: '最小化',
    accelerator: 'CmdOrCtrl+M',
    role: 'minimize'
  }, {
    label: '关闭',
    accelerator: 'CmdOrCtrl+W',
    role: 'close'
  }]
}, {
  label: '帮助',
  role: 'help',
  submenu: [{
    label: '学习更多',
    click: function () {
      electron.shell.openExternal('http://electron.atom.io')
    }
  }]
}]

function addUpdateMenuItems (items, position) {
  if (process.mas) return

  const version = electron.app.getVersion()
  let updateItems = [{
    label: `Version ${version}`,
    enabled: false
  }, {
    label: '正在检查更新',
    enabled: false,
    visible: false,
    key: 'checkingForUpdate'
  }, {
    label: '检查更新',
    enabled: true,
    key: 'checkForUpdate',
    click: function () {
      getUpdateData();
    }
  }, {
    label: '正在下载更新',
    enabled: false,
    visible: false,
    key: 'downloading',
  }, {
    label: '重启并安装更新',
    enabled: true,
    visible: false,
    key: 'restartToUpdate',
    click: function () {
      updateApp();
    }
  }]

  items.splice.apply(items, [position, 0].concat(updateItems))
}


const http = require('http');
const querystring = require('querystring');
var getUpdateData = function () {
  // state = 'checking';
  var url = 'http://sale.flnet.com/zhuanti/tools/updates/update.txt';

  http.get(url, function (res) {
    var statusCode = res.statusCode;

    if (statusCode !== 200) {
        // 出错回调
        error();
        // 消耗响应数据以释放内存
        res.resume();
        state = 'no-update';
        return;
    }
    res.setEncoding('utf8');
    var rawData = '';
    res.on('data', function (chunk) {
      rawData += chunk;
    });

    // 请求结束
    res.on('end', function () {
      // 成功回调
      download = querystring.parse(rawData);
      if(electron.app.getVersion() != download.version.replace(/[\r\n]/g,"")) {
        state = 'installed';
        updateMenu();
      } else {
        console.log("It's lastest version already!");
        state = 'no-update';
        updateMenu();
      }
    }).on('error', function (e) {
      // 出错回调
      state = 'no-update';
      updateMenu();
    });

  });
};

function updateApp() {
    state = 'downloading';
    updateMenu();
    var downloadUrl = 'http://sale.flnet.com/zhuanti/tools/updates/' + download.version.replace(/[\r\n]/g,"") + '\/app.zip';
    var downloadAddress = path.join(__dirname, './../../')

    win.webContents.downloadURL(downloadUrl);
    win.webContents.session.on('will-download', (event, item, webContents) => {
      // Set the save path, making Electron not to prompt a save dialog.
      item.setSavePath(downloadAddress+`\\${item.getFilename()}`);
      item.once('done', (event, state) => {
        if (state === 'completed') {
          //console.log('Download successfully')
          var fs = require("fs");
          var unzip = require("unzip");
          var zipDir = path.join(downloadAddress, '/app.zip')
          var unzipExtractor = unzip.Extract({ path: './resources' })
          unzipExtractor.on('error', function(err) {
            throw err;
          });
          unzipExtractor.on('close', app.quit);
          fs.createReadStream(zipDir).pipe(unzipExtractor); //unzip方法会直接覆盖原有的文件
        } else {
          //console.log('Download failed')
          state = 'installed';
          updateMenu();
        }
      })
    })

}

function updateMenu () {
  var menu = Menu.getApplicationMenu()
  if (!menu) return

  menu.items.forEach(function (item) {
    if (item.submenu) {
      item.submenu.items.forEach(function (item) {
        switch (item.key) {
          case 'checkForUpdate':
            item.visible = state === 'no-update'
            break
          case 'checkingForUpdate':
            item.visible = state === 'checking'
            break
          case 'downloading':
            item.visible = state === 'downloading'
            break
          case 'restartToUpdate':
            item.visible = state === 'installed'
            break
        }
      })
    }
  })
}

function findReopenMenuItem () {
  const menu = Menu.getApplicationMenu()
  if (!menu) return

  let reopenMenuItem
  menu.items.forEach(function (item) {
    if (item.submenu) {
      item.submenu.items.forEach(function (item) {
        if (item.key === 'reopenMenuItem') {
          reopenMenuItem = item
        }
      })
    }
  })
  return reopenMenuItem
}


if (process.platform === 'win32') {
  const helpMenu = template[template.length - 1].submenu
  addUpdateMenuItems(helpMenu, 0)
}

app.on('ready', function () {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
})

app.on('browser-window-created', function () {
  let reopenMenuItem = findReopenMenuItem()
  if (reopenMenuItem) reopenMenuItem.enabled = false
})

app.on('window-all-closed', function () {
  let reopenMenuItem = findReopenMenuItem()
  if (reopenMenuItem) reopenMenuItem.enabled = true
})

function reLoadMenu () {
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

module.exports = reLoadMenu; //给出一个接口便于重新加载menu
