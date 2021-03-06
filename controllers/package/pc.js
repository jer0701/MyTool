﻿/**
 *  生成pc端专题模板
 *  
 */
var path =require('path');
var fl = require("./node-lib/fl");
var fs = require("fs");
var imageinfo = require("imageinfo");
//var images = require("images");
var $ = require('cheerio');
var cf = require("./zt-config");


//解决 html中文字符 编码问题
$.prototype.options.decodeEntities = false;


//专题名称
var ztName = cf.ztName;


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
var floor = {};
var floorKey = "cn";


//添加专题前缀路径
var addZtPath = function (a) {
    a = a.map(function (t) {
        return ztName + "/" + t;
    })
    return a;
};


imgs.forEach(function (s) {
    var a = s.split('_');
    var o = a[0];
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
}


//生成专题
fl.mkHtml({

    //hbs模板 视图路径 本函数实际没有用到 但不写会报错
    views: path.join(__dirname, cf.viewsPath),

    //模板路径
    tplpath: path.join(__dirname, cf.pcTplPath),

    //模板保存的路径
    savepath: path.join(__dirname, cf.tplSavePath),

    //模板数据
    datas: {
        title: ztName.split('-').pop() + " - 富连网",
        bn: bn,
        cns: floor
    },
    callback: function () {
        console.log("PC专题模板已生成。");
    }
});


