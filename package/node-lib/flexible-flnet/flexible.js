; (function (win) {

    var zwidth = 640;
    var tid;
    var dpr = 0;
    var doc = win.document;
    var docEl = doc.documentElement;
    var metaEl = doc.querySelector('meta[name="viewport"]');
    var flexibleEl = doc.querySelector('meta[name="flexible"]');
    var isPc = function () {
        return !(navigator.userAgent.match(/(phone|pad|pod|iPhone|iPod|ios|iPad|Android|Mobile|BlackBerry|IEMobile|MQQBrowser|JUC|Fennec|wOSBrowser|BrowserNG|WebOS|Symbian|Windows Phone)/i))
    }();
    var scale = isPc ? 1 : 0.5;
    var setMetaEl = function (scale) {
        metaEl.setAttribute('name', 'viewport');
        metaEl.setAttribute('content', 'initial-scale=' + scale + ', maximum-scale=' + scale + ', minimum-scale=' + scale + ', user-scalable=no');
    };

    function refreshRem() {

        var width = docEl.getBoundingClientRect().width;

        if (width / dpr > zwidth) {
            width = zwidth * dpr;
        }

        docEl.style.fontSize = (width / 10) + 'px';
    }

    if (!metaEl) {
        metaEl = doc.createElement('meta');
        setMetaEl(scale);
     
        if (docEl.firstElementChild) {
            docEl.firstElementChild.appendChild(metaEl);
        } else {
            var wrap = doc.createElement('div');
            wrap.appendChild(metaEl);
            doc.write(wrap.innerHTML);
        }
    }

    if (metaEl) {
      
        var match = metaEl.getAttribute('content').match(/initial\-scale=([\d\.]+)/);

        if (match) {
            scale =  parseFloat(match[1]);
        }

        dpr = parseInt(1 / scale);

        if (isPc && scale != 1) {
            dpr = scale = 1;
            setMetaEl(1);
        }
    } 

    if (!dpr && !scale) {

        var isAndroid = win.navigator.appVersion.match(/android/gi);
        var isIPhone = win.navigator.appVersion.match(/iphone/gi);
        var devicePixelRatio = win.devicePixelRatio;

        if (isIPhone) {
            // iOS下，对于2和3的屏，用2倍的方案，其余的用1倍方案
            if (devicePixelRatio >= 3 && (!dpr || dpr >= 3)) {                
                dpr = 3;
            } else if (devicePixelRatio >= 2 && (!dpr || dpr >= 2)){
                dpr = 2;
            } else {
                dpr = 1;
            }
        } else {
            // 其他设备下，仍旧使用1倍的方案
            dpr = 1;
        }
        scale = 1 / dpr;

    }


    docEl.setAttribute('data-dpr', dpr);

    win.addEventListener('resize', function() {
        clearTimeout(tid);
        tid = setTimeout(refreshRem, 1);
    }, false);

    win.addEventListener('pageshow', function(e) {
        if (e.persisted) {
            clearTimeout(tid);
            tid = setTimeout(refreshRem, 1);
        }
    }, false);

    if (doc.readyState === 'complete') {
        doc.body.style.fontSize = 12 * dpr + 'px';
    } else {
        doc.addEventListener('DOMContentLoaded', function(e) {
            doc.body.style.fontSize = 12 * dpr + 'px';
        }, false);
    }
    
    refreshRem();


})(window);