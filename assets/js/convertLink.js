function isNameH(txt) {
    return txt.indexOf("商品名")>-1 || txt.indexOf("商品名称")>-1|| txt.indexOf("名称")>-1|| txt.indexOf("简称")>-1;
}

function isNumberH(txt) {
    return txt.indexOf("商品编号")>-1||txt.indexOf("料号")>-1 ;
}

function isLinkH(txt) {
    return txt.indexOf("链接")>-1 ;
}


function trimRL(s){
    return s.replace(/(^\s*)|(\s*$)/g, "");
}


function getTbData(tbHtml) {
     var $tbBox = $("<div/>");

    $tbBox.append(tbHtml);
    var $trs = $tbBox.find("tr");

    var numberIndex = -1;
    var nameIndex = -1;
    var linkIndex = -1;
    var tbData = [];
    var hasFindHead = false;
    var headTdLength = -1;

    var findHead = function (txt, j, length) {

        if (hasFindHead) return;

        if (isNumberH(txt)) {
            numberIndex = j;
        }
        else if (isNameH(txt)) {
            nameIndex = j;
        }
        else if (isLinkH(txt)) {
            linkIndex = j;
        }

        if (numberIndex > -1 && nameIndex > -1 && linkIndex > -1) {

            hasFindHead = true;
            headTdLength = length;
        }

    };
   
    //console.log($trs.length);
    $trs.each(function (i) {

        var $tr = $(this);
        var $tds = $tr.find("td");
        var length = $tds.length;

        //console.log(numberIndex + "," + nameIndex + "," + linkIndex);
 
        if (!hasFindHead) {
            $tds.each(function (j) {

                var $td = $(this);
                var txt = $td.text();
           
                findHead(txt, j, length);
            });
            
            return;
        }

        //console.log(($tds.length + 1)+","+headTdLength);
        var number = "",
            obj = {};
        if (($tds.length + 1) == headTdLength) {
            number = $tds.eq(numberIndex - 1).text();
            number = $.trim(number);
            //console.log(number);
            if (/^[0-9]{10}[cC]$/.test(number)) {
                obj.number = number;
                obj.name =trimRL($tds.eq(nameIndex - 1).text()) ;
                obj.link = trimRL($tds.eq(linkIndex - 1).text());
                tbData.push(obj);
            }
        }
        else if($tds.length  == headTdLength) {
            number = $tds.eq(numberIndex).text();
            number = $.trim(number);

            if (/^[0-9]{5,20}[cC]$/.test(number)) {
                obj.number = number;
                obj.name = trimRL($tds.eq(nameIndex).text());
                obj.link = trimRL($tds.eq(linkIndex).text());
                tbData.push(obj);
            }
        }


       
        
    });

    return tbData;
};



$(function () {

    var tbHtml = store.get("tbHtml");
    var ztHtml = store.get("ztHtml");

    if (ztHtml) {
        
       $("#ztHtml").val(ztHtml);
    }
    if (tbHtml) {
        
        setTimeout(function () {
             tbHtmlEditor.setContent(tbHtml);
        },1000);
    }

    
    $("#clear").bind("click", function () {
        tbHtmlEditor.setContent("");
        $("#ztHtml").val("");
        $("#converHtml").val("");
        store.set("tbHtml", "");
        store.set("ztHtml","");
    })

    $("#conver").bind("click", function () {


        tbHtml = tbHtmlEditor.getContent();
        ztHtml = $("#ztHtml").val();
        var tbData = getTbData(tbHtml);
      store.set("tbHtml", tbHtml);
      store.set("ztHtml", ztHtml);

      if (ztHtml == "" || tbData.length == 0) {

          if (ztHtml == "") {
              console.log("html is empty.");
          }
          else {
               console.log("data is empty.");
          }
           
            return;
        }
        console.log(tbData);
        var aSelector = $("#aSelector").val() || "a";
        var $msg = $("#msg");
        var $ztBox = $("<div/>");

        $ztBox.append(ztHtml);
        var $as = $ztBox.find(aSelector);

        if ($as.length != tbData.length) {
            $msg.html("a（"+$as.length+"）链接 和表格数据("+tbData.length+")数量不一致");
        }

        var k = 0;
        $as.each(function (i) {
            var $that = $(this);
          

            var data = tbData[k];

            //console.log(data);
            $that.attr("title", data.name);
            $that.attr("href", data.link);
            $that.attr("target", "_blank");

            var $number = $that.find(".number");
            var $img = $that.find("img");
            if ($number.length > 0) {

                $number.attr("data-number", data.number);
            }

            if ($img.length > 0) {
                $img.attr("alt", data.name);
            }

            k++;
        });

        $("#converHtml").val($ztBox.html());
        $msg.html($msg.html() + "<br/><br/>" + "替换完成！");

       
    
    })

})

