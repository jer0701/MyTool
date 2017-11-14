/**
 *  生成pc端专题模板
 *  
 */
var path = require('path');
var fl = require("./node-lib/fl");
var fs = require("fs");
var imageinfo = require("imageinfo");
var $ = require('cheerio');
var cf = require("./zt-config");


//解决 html中文字符 编码问题
$.prototype.options.decodeEntities = false;




//原始专题名称
var _ztName = cf.ztName;

//专题名称
var ztName = cf.ztName;

//默认为PC端专题名称 移动端则加-mb
if (ztName.indexOf("-mb") == -1) {
    ztName += "-mb";
}

//模板保存路径
cf.tplSavePath = cf.tplSavePath.replace(_ztName, ztName);

//专题图片存放路径
cf.localImgPath = cf.localImgPath.replace(_ztName, ztName);


//专题图片路径
var baseImgPath = "images/";


//获取本地图片集合
var imgs = fl.getImageFiles(cf.localImgPath);

//banner图
var bn = {
    name: 'bn',
    bgs: [],
    height: 0
};

//楼层
var floorKey = "cn";
var floor = {};
var floorx = {};
var floors = [];

//添加专题前缀路径
var addZtPath = function (a) {
    a = a.map(function (t) {
        return ztName + "/" + t;
    })
    return a;
};

imgs.forEach(function (s) {
    var a = s.split('_');
    var o = a[0]
    s = baseImgPath + s;
    if (s.indexOf("bn") > -1) {
        bn.bgs.push(s);
    }

    if (s.indexOf(floorKey) > -1) {

        if (!floor[o]) {
            floor[o] = {
                name: o,
                index: o.replace(floorKey, ""),
                bgs: [s],
            };
        } else {
            floor[o].bgs.push(s);
        }
    }
});


//计算banner的高度
bn.height = fl.getImgsHeight(addZtPath(bn.bgs));


//计算各楼层高度
for (var o in floor) {
    floor[o].height = fl.getImgsHeight(addZtPath(floor[o].bgs));
    floors.push(o.replace(floorKey, ''));
}

floors.sort(function (a, b) { return a - b });

for (var o in floors) {
    var key = floorKey + floors[o];
    floorx[key] = floor[key]; 
}


//生成专题
fl.mkHtml({

   //hbs模板 视图路径 本函数实际没有用到 但不写会报错
    views: path.join(__dirname, cf.viewsPath),

    //模板路径
    tplpath: path.join(__dirname, cf.mbTplPath),

    //模板保存的路径
    savepath: path.join(__dirname, cf.tplSavePath ),

    //模板数据
    datas: {
        title: ztName.split('-').pop() + " - 富连网",
        bn: bn,
        cns: floorx
    },

    //生产专题回调函数
    callback: function () {
        console.log("Mb专题模板已生成。");
    }
});