/*var path = require('path');*/


//专题配置
var cf = {};

//专题名称
//cf.ztName = "zhuanti/2017-11/2017-11-10-1111fc";


//移动端专题打包 是否懒加载图片
cf.mbLzImg = true;

//pc端专题打包 是否懒加载图片
cf.pcLzImg = true;

//图片懒加载源属性 data- 形式 original
cf.lzImgAttr ="original";

//移动端专题 是否打包html
cf.mbPackHtml = true;

//移动端专题 是否打包css
cf.mbPackCss = true;

//暂时不做压缩
cf.pcCssCompress = true;
//cf.pcJsCompress = true;

//楼层className
cf.floorClassName = "cn";


//服务器图片路径
//cf.serverImgPath = cf.ztName + "/img.html";

//本地图片路径
cf.localImgPath = cf.ztName + "/images/";


//视图模板路径
cf.viewsPath = "./node-tpl/";

//移动端专题模板路径
cf.mbTplPath = cf.viewsPath+"mb.html";

//PC端专题模板路径
cf.pcTplPath = cf.viewsPath + "pc.html";

//pc端专题打包的模板路径
cf.pcpTplPath = cf.viewsPath + "pcp.html";

//生成专题模板保存的路径 PC端和移动端一致
cf.tplSavePath = cf.ztName + "/tpl.html";

//pc端专题打包保存路径
//cf.pcpSavePath = cf.ztName + "/zt.html";


module.exports = cf;
