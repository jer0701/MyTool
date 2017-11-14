/**
 *  打包移动端专题
 *  
 */

var path =require('path');
var fl = require("./node-lib/fl");
var fs = require("fs");
var imageinfo = require("imageinfo");
var $ = require('cheerio');
var cf = require("./zt-config");

//解决 html中文字符 编码问题
$.prototype.options.decodeEntities = false;


//专题名称
var ztName = cf.ztName;

//默认为PC端专题名称 移动端则加-mb
if (ztName.indexOf("-mb") == -1) {
    ztName += "-mb";
}



//恢复原来css
var unPackCss = function () {

    // css文件打包
    var cssPath = ztName + "/css/style.css";

    var cssStr = fs.readFileSync(cssPath, 'utf8');

    cssStr = fl.remToPx(cssStr);

    fs.writeFile(cssPath, cssStr, (err) => {
        if (err) throw err;
    });


};

//恢复原来html
var unPackHtml = function () {

    // html文件打包
    var htmlPath = ztName + "/index.html";
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
        console.log("移动端 " + ztName + " 专题已恢复");
    });

};


//恢复打包文件
unPackCss();
unPackHtml();