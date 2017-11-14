/**
 * 公共类库
 * author:xiaohe
 */

var fs = require("fs");
var path=require("path");
var UglifyJS = require("uglify-js");

var fl = {};

/**
 * CSS格式化 横向排列
 * @param {string} code css字符串
 */
fl.cssEncode = function (code) {

    code = code.replace(/(\s){2,}/ig, '$1');
    code = code.replace(/\t/ig, '');
    code = code.replace(/\n\}/ig, '\}');
    code = code.replace(/\n\{\s*/ig, '\{');
    code = code.replace(/(\S)\s*\}/ig, '$1\}');
    code = code.replace(/(\S)\s*\{/ig, '$1\{');
    code = code.replace(/\{\s*(\S)/ig, '\{$1');
    return code;
};



/**
 * CSS格式化 竖向排列
 * @param {string} code css字符串
 */
fl.cssDecode = function (code) {
    code = code.replace(/(\s){2,}/ig, '$1');
    code = code.replace(/(\S)\s*\{/ig, '$1 {');
    code = code.replace(/\*\/(.[^\}\{]*)}/ig, '\*\/\n$1}');
    code = code.replace(/\/\*/ig, '\n\/\*');
    code = code.replace(/;\s*(\S)/ig, ';\n\t$1');
    code = code.replace(/\}\s*(\S)/ig, '\}\n$1');
    code = code.replace(/\n\s*\}/ig, '\n\}');
    code = code.replace(/\{\s*(\S)/ig, '\{\n\t$1');
    code = code.replace(/(\S)\s*\*\//ig, '$1\*\/');
    code = code.replace(/\*\/\s*([^\}\{]\S)/ig, '\*\/\n\t$1');
    code = code.replace(/(\S)\}/ig, '$1\n\}');
    code = code.replace(/(\n){2,}/ig, '\n');
    code = code.replace(/:/ig, ':');
    code = code.replace(/  /ig, ' ');
    return code;
};


/**
 * CSS压缩 css compress
 * @param {string} code css字符串
 */
fl.cssMini = function (code) {

    code = code.replace(/\r\n/ig, '');
    code = code.replace(/(\s){2,}/ig, '$1');
    code = code.replace(/\t/ig, '');
    code = code.replace(/\n\}/ig, '\}');
    code = code.replace(/\n\{\s*/ig, '\{');
    code = code.replace(/(\S)\s*\}/ig, '$1\}');
    code = code.replace(/(\S)\s*\{/ig, '$1\{');
    code = code.replace(/\{\s*(\S)/ig, '\{$1');
    code = code.replace(/\/\*[^*/]*\*\//ig, "");

    return code;
};


/**
 * Js压缩 js compress
 * @param {string} code css字符串
 */
fl.jsMini = function (js,options) {
    return UglifyJS.minify(js,options).code;
};



/*获取文件夹下的所有文件
*
* @param {string} path 目录
*/
fl.getFileList =function (path) {
    var filesList = [];
    var files = fs.readdirSync(path);
    files.forEach(function (itm, index) {
        var stat = fs.statSync(path + itm);
        if (stat.isDirectory()) {
            //递归读取文件
            fl.getFileList(path + itm + "/", filesList)
        } else {

            var obj = {};//定义一个对象存放文件的路径和名字
            obj.path = path;//路径
            obj.filename = itm//名字
            filesList.push(obj);
        }
    })

    return filesList;
};



/*获取文件夹下的所有图片
*
* @param {string} path 目录
*/
fl.getImageFiles = function (path) {

    var imageinfo = require("imageinfo");
    var imageList = [];
    var s = fl.getFileList(path);

    fl.getFileList(path).forEach(function (item) {
        var ms = imageinfo(fs.readFileSync(item.path + item.filename));
        ms.mimeType && (imageList.push(item.filename))
    });

    return imageList;
};


/*
* 获取专题 html
* @param {string} path 目录
*/
fl.getZtHtml = function (html) {

    var str = "";
    html.replace(/<body>\s*([\s\S]*)\s*<\/body>/, function ($0, $1) {
        str = $1;
        return $1;
    });
    str = str.replace(/<script\s+src=\"(?!http).*">[\s\S]*<\/script>/g, '');
    str = str.replace(/\s*$/, '');

    return str;
}

/**
* 
* 将本地图片替换为服务器图片
*
* @param {string} str html字符串
* @param {object} imgs 图片对象集合
*/
fl.replaceImg = function (str, imgs) {

    str = str.replace(/[^"'\(]*images\/([^"'\()]*\.[a-zA-Z]{3,4})/g, function ($0, $1, $2) {

        return (imgs[$1]) || $0;
    });

    return str;

};



/*
* 获取所有图片的高度
* @param{Array} imgs 图片集合 数组
*/
fl.getImgsHeight = function (imgs) {

    var i = 0,
        height = 0,
        images = require("images"),
        length =imgs.length;

    for (; i < length; i++) {
        height += +images(imgs[i]).size().height;

    }
    return height;
};




/**
 * px单位转换为rem单位
 * @param {string} str css字符串
 */
fl.pxToRem = function(str) {

    //专题根节点 html 默认字体
    var wt = 64;

    str = str.replace(/(\d+)px(?=[^a-zA-Z])/g, function ($0, $1) {
        if ($1 < 3) {
            return $1 + "px";
        }
        var str = +($1 / wt);
        if ((str + "").length > 9) {
            str = str.toFixed(8)
        }
        return str + "rem";
    });

    return str;
};


/**
 * rem单位转换为px单位
 * @param {string} str css字符串
 */
fl.remToPx = function(str) {

    //专题根节点 html 默认字体
    var wt = 64;

    str = str.replace(/([0-9.]+)rem(?=[^a-zA-Z])/g, function ($0, $1) {

        return parseInt((+$1) * wt) + "px";
    });

    return str;
};



/*
* 创建目录
* @param {string} 目录
* @callback{function} 回调函数
*/
fl.mkdir = function (dir, callback) {

	fs.mkdir(dir,0777, function (err) {
	   if (err) {
	   	throw err
	   }else{
	   	callback && callback(dir)
	   }
	});
};

/*
* 生成静态页
*/
fl.mkHtml = function (options) {

    var hbs = require("hbs");
    options = options ||{};

    // 默认配置
    var defaults = {
        settings:{},    // hbs 模板配置对象 不用填
        views:'',     // 视图文件夹路径 绝对路径
        tplpath:'',     // 生成静态页的模板页面  绝对路径
        savepath:'',    // 静态页保存的路径
        datas:{},       // 静态页面数据对象
        callback: null, // 回调函数
        cache: false    // 是否缓存  hbs模板配置参数 默认 false即可
    };

    //hbs模板配置
    var hbsOptions = {
        settings:{views : options.views},
        callback:options.callback,
        cache:options.cache
    };

    //合并 默认配置
    for(var o in defaults){
        if(options[o]===undefined){
            options[o]=defaults[o];
        }	
    }

    var datas= options.datas;

    for(var o in datas){

        if(hbsOptions[o] === undefined){
            hbsOptions[o] = datas[o];
        }

    }

 
    var engine = hbs.__express;
    var done = function(x,str){
        //console.log(str);
        fs.writeFile(options.savepath,str, (err) => {
            if (err) throw err;
        if(options.callback) options.callback();
        });
    };
    console.log("yy"+options.tplpath);
    engine(options.tplpath,hbsOptions,done);
};


module.exports = fl;