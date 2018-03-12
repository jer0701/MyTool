首先需要安装electron-prebuilt（用来终端执行electron ./app 命令）,需要高版本的node才可以安装，经过测试 6.x不支持 8.x支持

1.打包成exe的时候要开代理，不然报连接错误
2.开发的时候模块都可以使用淘宝镜像（cnpm）下载，但是打包成exe的时候最好删除node_modules模块，使用npm重新下载，不然打包出来的exe总是会报模块缺失

把生成的exe文件所有文件放入build目录中

3.打包成windows install文件，有如下两种方法：

第一种：
需要squirrel.exe (https://github.com/Squirrel/Squirrel.Windows/releases）
    nuget.exe (http://www.nuget.org/nuget.exe)

    build目录执行命令nuget spec生成Package.nuspec文件，根据项目配置这个文件

    然后用下面的命令创建一个nuget包，
    nuget pack Package.nuspec

安装grunt-electron-installer
配置gruntfile.js
执行grunt create-windows-installer

第二种：使用electron-winstaller （https://www.npmjs.com/package/electron-winstaller）
创建electron-winstaller.js 如下配置

var packagePath = 'build';
var installerPath = 'release';
var iconPath = 'assets/img/tools.ico';
var gifPath = 'assets/img/loading.gif';
function generateInstaller() {
    var electronInstaller = require('electron-winstaller');
    electronInstaller.createWindowsInstaller({
        appDirectory: packagePath,
        outputDirectory: installerPath,
        loadingGif: gifPath,
        authors: 'flnet',
        exe: 'tools.exe',
        title: 'flnetTools',
        setupIcon: iconPath,
        setupExe: 'Setup.exe',
        description: 'tools',
        noMsi: true
    }).then(() => console.log("It worked!"), (e) => console.log(`No dice: ${e.message}`));
}
generateInstaller();


执行node electron-winstaller.js即可，显然这种方式方便了许多


注意：这两种打包方式的安装都没有自定义安装路径，他们都是借助了Squirrel方式

应用程序实现更新有两种方式:
1. 采用electron api: autoUpdate，调用api方法即可实现更新，需要把更新的release目录下面的文件放到类似亚马逊S3文件服务器中，如下：
autoUpdater.setFeedURL(`http://url?version=${app.getVersion()}`)
autoUpdater.checkForUpdates()

这里我没有文件服务器，只能采取第二种方式
2. 把需要更新的app目录打包成zip文件放在任意位置进行访问下载，然后采用unzip库解压到相应的文件目录即可
var downloadUrl = 'http://url/' + download.version.replace(/[\r\n]/g,"") + '\/app.zip';
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
缺点是只能更新应用的功能，至于图标之类的不能进行更新
