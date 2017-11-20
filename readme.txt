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