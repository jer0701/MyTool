1.打包成exe的时候要开代理，不然报连接错误
2.开发的时候模块都可以使用淘宝镜像（cnpm）下载，但是打包成exe的时候最好删除node_modules模块，使用npm重新下载，不然打包出来的exe总是会报模块缺失

把生成的exe文件所有文件放入build目录中

3.打包成windows install文件：
需要squirrel.exe (https://github.com/Squirrel/Squirrel.Windows/releases）
    nuget.exe (http://www.nuget.org/nuget.exe)

    build目录执行命令nuget spec生成Package.nuspec文件，根据项目配置这个文件

    然后用下面的命令创建一个nuget包，
    nuget pack Package.nuspec


安装grunt-electron-installer
配置gruntfile.js

执行grunt create-windows-installer