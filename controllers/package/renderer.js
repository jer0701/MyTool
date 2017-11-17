const electron = require('electron')
const ipcRenderer = electron.ipcRenderer;
const fs = require('fs');
const path = require('path');
const Menu = electron.remote.Menu;
//console.log(__dirname); //因为当前目录是处于views/package
var getFileDir = require('./../../controllers/package/getDir.js'),
  pcp = require('./../../controllers/package/pcp.js'),
  mbp = require('./../../controllers/package/mbp.js'),
  mbb = require('./../../controllers/package/mbb.js'),
  settings = {};

//普通数组快速排序算法
function swap(myArray, p1, p2) {
  var temp = myArray[p1];
  myArray[p1] = myArray[p2];
  myArray[p2] = temp;
}

function position(myArray, left, right) {
  var pivot = myArray[right];
  var tail = left - 1;

  for (var i = left; i < right; i++) {
    if (myArray[i] > pivot) {
      tail++;
      swap(myArray, tail, i);
    }
  }
  swap(myArray, tail + 1, right);
  return tail + 1;
}

function quickSort(myArray, left, right) {
  if (myArray.length < 2) {
    return myArray;
  }

  left = (typeof left !== "number" ? 0 : left);
  right = (typeof right !== "number" ? myArray.length - 1 : right);

  var index = position(myArray, left, right);

  if (left < index - 1) {
    quickSort(myArray, left, index - 1);
  }

  if (index < right) {
    quickSort(myArray, index + 1, right);
  }


  return myArray;
}

//fileDir数组快速排序
function positionJSON(myArray, left, right) {
  var pivot = myArray[right].ctime;
  var tail = left - 1;

  for (var i = left; i < right; i++) {
    if (myArray[i].ctime > pivot) { //根据ctime创建时间排序
      tail++;
      swap(myArray, tail, i);
    }
  }
  swap(myArray, tail + 1, right);　　　　　　　　　　　　　　　　
  return tail + 1;
}

function quickSortJSON(myArray, left, right) {
  if (myArray.length < 2) {
    return myArray;
  }

  left = (typeof left !== "number" ? 0 : left);
  right = (typeof right !== "number" ? myArray.length - 1 : right);

  var index = positionJSON(myArray, left, right);

  if (left < index - 1) {
    quickSortJSON(myArray, left, index - 1);
  }

  if (index < right) {
    quickSortJSON(myArray, index + 1, right);
  }


  return myArray;
}


//数组去重
var uniqueArr = function(Arr) {
  var result = [];
  for (var i = 0; i < Arr.length; i++) {
    if (result.indexOf(Arr[i]) === -1) {
      result.push(Arr[i]);
    }
  }
  return result;
}

//格式化时间格式如："yyyy-MM-dd HH:mm:ss" ["2017-11-01 09:38:30"]
var formatDate = function(Date, format) {
  format = format || "yyyy-MM-dd HH:mm:ss";

  var o = {
    "yyyy": Date.getFullYear(),
    "MM": Date.getMonth() + 1, //month
    "dd": Date.getDate(), //day
    "HH": Date.getHours(), //hour
    "mm": Date.getMinutes(), //minute
    "ss": Date.getSeconds(), //second
    "SS": Date.getMilliseconds() //millisecond
  }
  for (var i in o) {
    if ((o[i] + "").length < 2) o[i] = "0" + o[i];
    format = format.replace(i, o[i]);
  }

  return format;
};

var initFileDir = function() {
  getFileDir(function(fileDir) {
    if (!fileDir) return;
    //给data数组按照创建时间从最近到最远排列
    var data = quickSortJSON(fileDir);
    //$('textarea').text(data[0].dir);

    var length = data.length;
    if (!length) return;
    $(".Dir").html("");

    //获取文件夹创建的年份和月份（通过文件夹的命名来获取）
    var yearArr = [],
      monthArr = [],
      ctime, //临时变量存储文件夹的创建时间
      dirpath; //临时变量存储文件夹的创建的年份和月份
    for (var i = 0; i < length; i++) {
      ctime = formatDate(new Date(data[i].ctime)).split(" ");
      dirpath = ctime[0].split("-");
      yearArr.push(dirpath[0]);
      monthArr.push(dirpath[1]);

    }

    yearArr = quickSort(uniqueArr(yearArr));
    monthArr = quickSort(uniqueArr(monthArr));
    //console.log(monthArr);


    var markM = 0; //月份标记位 1表示新的月份 0表示旧的月份
    for (var y = 0, ylen = yearArr.length; y < ylen; y++) {
      for (var m = 0, mlen = monthArr.length; m < mlen; m++) {
        for (var i = 0; i < length; i++) {
          if (i == 0) { //重新开始循环，那么必然是进入新的月份
            markM = 1;
          }

          var value = data[i].dir;
          ctime = formatDate(new Date(data[i].ctime)).split(" ");
          dirPath = ctime[0].split("-");
          //console.log(value);
          if (dirPath[0] != yearArr[y]) continue;
          if (dirPath[1] != monthArr[m]) continue;

          if (markM) { //新的月份
            markM = 0;
            $(".Dir").append("<br><i>" + dirPath[0] + "-" + dirPath[1] + ":" + "</i>");
          }
          if (i % 2 == 0) {
            $(".Dir").append("<br>");
          }

          $(".Dir").append("<label><input name='path' type='radio' value='" + value + "' />" + value + "<span class='path'>" + data[i].path + "</span></label>");

        }

      }

    }

  });

};

var init = function() {
  $(".selectFile").bind("click", initFileDir);
  //pcp打包
  $("#pcp").bind("click", function(event) {
    /* Act on the event */
    var value = $('input[name="path"]:checked').val();

    if (value) {
      getSettings();
      var $span = $('input[name="path"]:checked').siblings();
      pcp($span.text(), settings, function(ztHTML) {
        $('textarea').text(ztHTML);
      });

    } else {
      alert("请先选择需要打包的专题目录");
    }
  });
  $("#mbp").bind("click", function(event) {
    /* Act on the event */
    var value = $('input[name="path"]:checked').val();

    if (value) {
      getSettings();
      var $span = $('input[name="path"]:checked').siblings();
      var ztpath = $span.text() + "-mb";
      if(!fs.existsSync(path.normalize(ztpath))) {
        alert("选择的移动端目录不存在");
        return
      }

      mbp(ztpath, settings, function(){
        $("p").text("移动端" + value + "打包成功");
      });

    } else {
      alert("请先选择需要打包的专题目录");
    }
  });
  $("#mbb").bind("click", function(event) {
    /* Act on the event */
    var value = $('input[name="path"]:checked').val();

    if (value) {
      getSettings();
      var $span = $('input[name="path"]:checked').siblings();
      var ztpath = $span.text() + "-mb";
      if(!fs.existsSync(path.normalize(ztpath))) {
        alert("选择的移动端目录不存在");
        return
      }
      
      mbb(ztpath, settings, function() {
        $("p").text("移动端" + value + "恢复成功");
      });

    } else {
      alert("请先选择需要恢复的专题目录");
    }
  });
  //清空按钮
  $("#clear").bind("click", function(event) {
    /* Act on the event */
    $('textarea').text("");

  });

  //复制按钮
  $("#copy").bind("click", function(event) {
    /* Act on the event */
    var copyobject = document.getElementById("copy-content");
    copyobject.select();
    document.execCommand("Copy");
  });

  $("#preCheck").bind("click", function(event) {
    /* Act on the event */
    var value = $('input[name="path"]:checked').val();

    if (value) {
      var $span = $('input[name="path"]:checked').siblings();
      var PreviewPath = path.join($span.text(), "./zt.html");
      if (!fs.existsSync(PreviewPath)) {
        alert("zt.html不存在，请先选择打包该专题");
        return;
      };
      ipcRenderer.send("loadurl-message", PreviewPath);

    } else {
      alert("请先选择预览的专题目录");
    }

  });
}

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
  }, {
    label: '设置',
    submenu:[{
      label: 'PC懒加载', type: 'checkbox', key: 'pcLzImg', checked: true 
    }, {
      label: 'MB懒加载', type: 'checkbox', key: 'mbLzImg', checked: true 
    }],
    click: function() {
        //alert("nothing to set");
      }
  }]

  var menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

var getSettings = function(){
  var menu = Menu.getApplicationMenu();
  if (!menu) return;

  menu.items.forEach(function (item) {
    if (item.submenu) {
      item.submenu.items.forEach(function (item) {
        if (item.key === 'pcLzImg') {
          if(!item.checked) {
            settings.pcLzImg = false;
          } else {
            settings.pcLzImg = true;
          }
        }
        if (item.key === 'mbLzImg') {
          if(!item.checked) {
            settings.mbLzImg = false;
          } else {
            settings.mbLzImg = true;
          }
        }

      })
    }
  })
}

$(function() {
  setMenu();
  init();

})