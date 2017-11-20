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