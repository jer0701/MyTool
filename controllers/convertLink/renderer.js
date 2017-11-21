const electron = require('electron')
const ipcRenderer = electron.ipcRenderer;
const fs = require('fs');
const path = require('path');
const Menu = electron.remote.Menu;

function setMenu() {
  const version = electron.remote.app.getVersion()
  let template = [{
    label: '首页',
    click: function() {
      ipcRenderer.send("Home");
    }
    },{
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
      role: 'reload'
    }, {
      label: '切换全屏',
      accelerator: (function() {
        if (process.platform === 'darwin') {
          return 'Ctrl+Command+F'
        } else {
          return 'F11'
        }
      })(),
      click: function(item, focusedWindow) {
        if (focusedWindow) {
          focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
        }
      }
    }, {
      label: '切换开发者工具',
      accelerator: (function() {
        if (process.platform === 'darwin') {
          return 'Alt+Command+I'
        } else {
          return 'Ctrl+Shift+I'
        }
      })(),
      click: function(item, focusedWindow) {
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
      label: `Version ${version}`,
      enabled: false
    }, {
      label: '学习更多',
      click: function() {
        electron.shell.openExternal('http://electron.atom.io')
      }
    }]
  }]

  var menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

$(function() {
  setMenu();

})