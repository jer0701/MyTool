/**
 *  恢复打包移动端专题
 *  
 */

var fl = require("./node-lib/fl");
var fs = require("fs");
var $ = require('cheerio');
var config = require("./zt-config");

//解决 html中文字符 编码问题
$.prototype.options.decodeEntities = false;


var mbb = function(ztPath, callback) {
    if(!ztPath) return;
    var cf = {
        //专题路径名
        ztName: ztPath,
        //服务器图片路径
        serverImgPath: ztPath + "/img.html",

        //pc端专题打包保存路径
        pcpSavePath: ztPath + "/zt.html"
    }

    for(var i in config) {
        cf[i] = config[i];
    }

    //默认为PC端专题名称 移动端则加-mb
    if (cf.ztName.indexOf("-mb") == -1) {
          cf.ztName += "-mb";
    }



    //恢复原来css
    var unPackCss = function () {

        // css文件打包
        var cssPath = cf.ztName + "/css/style.css";

        var cssStr = fs.readFileSync(cssPath, 'utf8');

        cssStr = fl.remToPx(cssStr);

        fs.writeFile(cssPath, cssStr, (err) => {
            if (err) throw err;
        });


    };

    //恢复原来html
    var unPackHtml = function () {

        // html文件打包
        var htmlPath = cf.ztName + "/index.html";
        var htmlStr = fs.readFileSync(htmlPath, 'utf8');
        var $divBox = $("<div/>").html(htmlStr);
        var $ztContainer = $divBox.find(".zt-container");
        var $imgs = $('img', $ztContainer);

        //移除img节点样式
        $imgs.removeAttr("style");

        $imgs.each(function () {


            var $that = $(this);

            if (!$that.data("echo")) {
                return
            }

            $that.attr('src', $that.data("echo"));
            $that.removeAttr('data-echo');

        });

        htmlStr = $divBox.html();

        fs.writeFile(htmlPath, htmlStr, (err) => {
            if (err) throw err;
            callback();
        });

    };


    //恢复打包文件
    unPackCss();
    unPackHtml();
}

module.exports = mbb;