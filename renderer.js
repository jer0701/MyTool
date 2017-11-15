// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

const fs = require('fs');
const path = require('path');
const async = require('async')


const electron = require('electron');
const dialog = electron.remote.dialog;


//获取含有index.html文件的文件目录
var getDir = function(filePath, zhuantiDir, callback) {

  var pa = fs.readdirSync(filePath);
  pa.forEach(function(ele,index){  
        var tempDir = path.join(filePath, ele);
        var info = fs.statSync(tempDir);
        //console.log(info);   
        if(!info.isDirectory()) return;
        if(info.isDirectory()){  
            getDir(tempDir, zhuantiDir, callback); //只要是目录，就继续往下递归查找
            if(!fs.existsSync(path.join(tempDir, "./index.html"))) return;
            if(!fs.existsSync(path.join(tempDir, "./img.html"))) return; //相当于过滤了移动端（mb）
            if(!fs.existsSync(path.join(tempDir, "./css"))) return;
            if(!fs.existsSync(path.join(tempDir, "./js"))) return;
            if(!fs.existsSync(path.join(tempDir, "./images"))) return;
            console.log(tempDir.split("\\").pop());
            callback(tempDir, tempDir.split("\\").pop(), info.birthtime.getTime()); //创建时间
   
        }
        
  });
}

var openDialog = function (callback){
	dialog.showOpenDialog({
        properties: [
            'openFile', 'openDirectory'
        ]
    },function(res){
        console.log(res[0]); //数组中只有一个值，因为没有多选
        callback(null, path.normalize(res[0]));
     

    })
}

var savePath = function(arg, callback) {
    var fileDir = [];
    getDir(arg, arg, function(path, dirStr, ctime) {
            var dataJSON = {
              path: path,
              dir: dirStr,
              ctime: ctime
            }
            fileDir.push(dataJSON);
    });
    callback(null, fileDir);
}





module.exports = function(callback) {
    async.waterfall([
        openDialog,
        savePath
    ], function (err, result) {
        callback(result);
    });
}

