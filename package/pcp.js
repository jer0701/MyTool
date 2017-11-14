/**
 *  打包pc端专题
 *  
 */
var path =require('path');
var fl = require("./node-lib/fl");
var fs = require("fs");
var imageinfo = require("imageinfo");
//var images = require("images");
const nativeImage = require('electron').nativeImage;
var $ = require('cheerio');
var config = require("./zt-config");

//解决 html中文字符 编码问题
$.prototype.options.decodeEntities = false;



//绑定图片懒加载
var bindLzImg = function (htmlStr, ztPath) {

    var $divBox = $("<div/>").html(htmlStr);
    var $ztContainer = $divBox.find(".zt-container");
    var $imgs = $('img', $ztContainer);
    var floorClassName = cf.floorClassName;
    var floorSelector = "." + floorClassName
    var $cns = $(floorSelector, $ztContainer);

    //可视区域高度
    var vpHeight = 950;
    var bgImgHeight = 0;
    var fromTop = 100;

    //懒加载图片源属性 data- 形式
    var attr = cf.lzImgAttr;

    //默认空白图片
    var bsrc = "http://www.flnet.com/content/images/g.png";

    //获取列数字
    var getColNum = function (c) {
        return (c || 0) && (c = c.match(/(^|\s)row-col-(\d+)(\s|$)/)) && c[2] || 0;
    };

    $imgs.each(function () {


        var $that = $(this);
        var src = $that.data(attr) || $that.attr("src");
        var _src = src;
        src = path.join(__dirname, ztPath + "/" + src.split("?").shift());
        var image = nativeImage.createFromPath(src);
        var size = image(src).getSize();
        //var size = images(src).size();
        var w = size.width;
        var h = size.height;
        var isBnImg = $that.closest(".zt-banner").length;
        var isBgImg = $that.closest(".bg").length;
        var isProImg = $that.closest(".img").length;
        var isNeedLzImg = true;
        var $cn = $that.closest(floorSelector);
        var cnIndex = $cn.length ? $cns.index($cn) : -1;

        //设置图片尺寸
        $that.css({ width: w + "px", height: h + "px" })

        //首屏图片不进行懒加载处理
        if (isBnImg) {

            if (w == 1920) {

                bgImgHeight += h;
                fromTop += h;
            }

            isNeedLzImg = false;
        }

        //只对第一个楼层做不懒加载图片判断
        if ($cn && $cn.length && cnIndex == 0) {

            //背景图片的判断
            if (isBgImg && bgImgHeight < vpHeight) {

                bgImgHeight += h;
                isNeedLzImg = false;
            }

            //产品图片判断
            if (isProImg && fromTop < vpHeight) {

                var $row = $that.closest(".row");
                var $cols = $row.find(".col");
                var colIndex = $cols.index($that.closest(".col"));
                var colCount = $row.length ? getColNum($row.attr("class")) : 1;

                if (colCount - colIndex <= colCount) {
                    isNeedLzImg = false;
                }

                if ((colIndex + 1) % colCount == 0) {
                    fromTop += h;
                }

            }

            //其它图片都不设置懒加载
            if (!isBgImg && !isProImg) {
                isNeedLzImg = false;
            }

        }

        //图片懒加载
        if (cf.pcLzImg && isNeedLzImg) {

            $that.attr("data-" + attr, _src);
            $that.attr("src", bsrc);

        }

        //不懒加载图片 恢复初始状态
        if ((!cf.mbLzImg || !isNeedLzImg) && $that.data(attr)) {

            $that.attr("src", $that.data(attr));
            $that.removeAttr("data-" + attr);
        }
    });

    return $divBox.html();
};


//专题打包成html
var packHtml = function (ztPath) {
    if(!ztPath) return;
    var serverImgPath = ztPath + "/img.html";
    var cf = {
        //专题路径名
        ztName: ztPath,
        //服务器图片路径
        serverImgPath: serverImgPath,

        //pc端专题打包保存路径
        pcpSavePath: ztPath + "/zt.html"
    }

    for(var i in config) {
        cf[i] = config[i];
    }
    
    if (!fs.existsSync(cf.serverImgPath)){

        console.log("打包出错，img.html 不存在。");
        return;
    }

    var datas = {
        style: "body{font-size:16px;}",
        html: "<h1>这是一个生成的模板</h1>",
        js: 'console.log("生成成功.")',
        lzImg: true
    };

    datas.style = fs.readFileSync(ztPath + "/css/style.css", 'utf8');
    datas.js = fs.readFileSync(ztPath + "/js/my.js", 'utf8');
    datas.html = fl.getZtHtml(fs.readFileSync(ztPath + "/index.html", 'utf8'));


    var imgs = {};
    var imgStr = fs.readFileSync(cf.serverImgPath, 'utf8');
    var $imgs = $("<div/>").append($(imgStr)).find("img");

    $imgs.each(function () {
        var $that = $(this);
        imgs[$that.attr("title")] = $that.attr("src");
    });

    //图片懒加载处理
    if (cf.pcLzImg) {
        datas.html = bindLzImg(datas.html, ztPath);
    }

    //替换为服务器路径
    datas.html = fl.replaceImg(datas.html, imgs);

    datas.style = fl.replaceImg(datas.style, imgs);
    datas.js = fl.replaceImg(datas.js, imgs);


    //css压缩
    if (cf.pcCssCompress) {
        datas.style = fl.cssMini(datas.style);
    }

    //css 格式化
    if (cf.pcCssEncode) {
        datas.style = fl.cssEncode(datas.style);
    }

    //js压缩
    if (cf.pcJsCompress) {
        datas.js = fl.jsMini(datas.js);
    }
  



    //生成专题
    fl.mkHtml({

        //hbs模板 视图路径 本函数实际没有用到 但不写会报错
        views: path.join(__dirname, cf.viewsPath),

        //打包文件模板路径
        tplpath: path.join(__dirname, cf.pcpTplPath),

        //打包文件保存路径
        savepath: path.normalize(cf.pcpSavePath),


        datas: datas,
        callback: function () {
            console.log("PC端" + ztPath + "专题已打包完成。");
        }
    });


};



//打包
//packHtml();
module.exports = packHtml;

