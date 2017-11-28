/**
 *  恢复打包移动端专题
 *
 */

var fl = require("./node-lib/fl");
var fs = require("fs");
var $ = require('cheerio');
var config = require("./zt-config");

//解决 html中文字符 编码问题
//$.prototype.options.decodeEntities = false;


var mbb = function(ztPath, settings, callback) {
    if(!ztPath) return;
    var cf = {
        //专题路径名
        ztName: ztPath
    }

    for (var i in config) {
        if(cf[i] === undefined) {
            cf[i] = config[i];
        }
    }
    for(var i in settings) {
        cf[i] = settings[i];
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
        var datas = {
        };
        // html文件打包
        var htmlPath = cf.ztName + "/index.html";
        var htmlStr = fs.readFileSync(htmlPath, 'utf8');
        datas.head = fl.getZtHead(htmlStr);
        datas.body = fl.getZtHtml(htmlStr);
        var $divBox = $("<div/>").html(datas.body);
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
        datas.body = htmlStr;

        //生成专题
        fl.mkHtml({

            //hbs模板 视图路径 本函数实际没有用到 但不写会报错
            views: path.join(__dirname, cf.viewsPath),

            //打包文件模板路径
            tplpath: path.join(__dirname, cf.mbpTplPath),

            //打包文件保存路径
            savepath: path.normalize(htmlPath),


            datas: datas,
            callback: function () {
              //console.log("PC端" + ztPath + "专题已恢复");
              callback && callback();
            }
        });

    };


    //恢复打包文件
    unPackCss();
    unPackHtml();
}

module.exports = mbb;
