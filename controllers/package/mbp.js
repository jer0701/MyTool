
/**
 *  打包移动端专题
 *  
 */

var path = require('path');
var fl = require("./node-lib/fl");
var fs = require("fs");
const nativeImage = require('electron').nativeImage;
var $ = require('cheerio');
var config = require("./zt-config");

//解决 html中文字符 编码问题
$.prototype.options.decodeEntities = false;


var mbp = function(ztPath, callback) {
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

    //打包 css
    var packCss = function (callback) {

        // css文件打包
        var cssPath = cf.ztName + "/css/style.css";

        var cssStr = fs.readFileSync(cssPath, 'utf8');

        cssStr = fl.pxToRem(cssStr);

        //cssStr = fl.CSSdecode(cssStr);

        fs.writeFile(cssPath, cssStr, (err) => {
            if (err) throw err;

            callback && callback();
        });

    };


    //打包 html
    var packHtml = function (callback) {

        var htmlPath = cf.ztName + "/index.html";
        var htmlStr = fs.readFileSync(htmlPath, 'utf8');
        var $divBox = $("<div/>").html(htmlStr);
        var $ztContainer = $divBox.find(".zt-container");
        var $imgs = $("img", $ztContainer);
        var floorClassName = cf.floorClassName;
        var floorSelector = "." + floorClassName
        var $cns = $(floorSelector, $ztContainer);

        //可视区域高度
        var vpHeight = 1200;
        var bgImgHeight = 0;
        var fromTop = 100;

        //懒加载图片源属性 data- 形式
        var attr =cf.lzImgAttr;

        //获取列数字
        var getColNum = function (c) {
            return (c||0) && (c = c.match(/row-col-(\d+)/)) && c[1] || 0;
        };

        $imgs.each(function () {

            var $that = $(this);
            var src = $that.data(attr) || $that.attr("src") || "";

            if(!src) return;

            var _src = src;
            src = path.normalize(cf.ztName + "/" + src.split("?").shift());
            var image = nativeImage.createFromPath(src);
            var size = image.getSize();
            //var size = images(src).size();
            var w = size.width;
            var h = size.height;
            var remW = w / 64;
            var remH = h / 64;
            var isBnImg = $that.closest(".zt-banner").length;
            var isBgImg = $that.closest(".bg").length;
            var isProImg = $that.closest(".img").length;
            var isNeedLzImg = true;



            var $cn = $that.closest(floorSelector);
            var cnIndex = $cn.length ? $cns.index($cn) : -1;

            //首屏图片不进行懒加载处理
            if (isBnImg) {

                if (w == 1920) {
                    bnImgHeight += h;
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

                //console.log(isProImg && fromTop < vpHeight);

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


            if (remW % 1 !== 0) {
                remW = remW.toFixed(5);
            }

            if (remH  % 1 !== 0) {
                remH = remH.toFixed(5);
            }


            $that.css({
                width: remW + "rem",
                height: remH + "rem"
            });


            //图片懒加载
            if (cf.mbLzImg && isNeedLzImg) {

                $that.attr("data-"+attr, _src);
                $that.attr("src", "images/g.png");

            }
            
            //不懒加载图片 恢复初始状态
            if ((!cf.mbLzImg || !isNeedLzImg) && $that.data(attr)){

                $that.attr("src", $that.data(attr));
                $that.removeAttr("data-"+attr);
            }
        

        });

        htmlStr = $divBox.html();

        fs.writeFile(htmlPath, htmlStr, (err) => {
            if (err) throw err;
            callback && callback();
        });


    };




    //打包
    if (cf.mbPackCss) {
        packCss(!cf.mbPackHtml && callback);
    }

    if (cf.mbPackHtml) {
        packHtml(callback);
    }
}

module.exports = mbp;