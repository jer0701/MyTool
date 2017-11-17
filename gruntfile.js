var grunt = require('grunt');

grunt.config.init({
	pkg: grunt.file.readJSON("package.json"),
	'create-windows-installer': {
		x64: {
			version:'1.0.1',
			authors:'flnet',
			appDirectory:'/Users/flnet8888/Desktop/Front_End/Electron/MyTool/build',
			outputDirectory:'/Users/flnet8888/Desktop/Front_End/Electron/MyTool/release',
			exe:'tools.exe',
			description:'tools'
		}
	}
});

grunt.loadNpmTasks('grunt-electron-installer');

grunt.registerTask('default', ['create-windows-installer']);