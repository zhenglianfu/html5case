/**
 * Created by Administrator on 2015/5/25.
 */
(function(window){
    var prefixs = ['webkit', 'moz', 'ms'],
        lastTime = 0;
    for (var i = 0, len = prefixs.length; i < len; i++) {
        if (window.requestAnimationFrame && window.cancelAnimationFrame) {
            break;
        }
        var prefix = prefixs[i];
        window.requestAnimationFrame = window[prefix + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[prefix + 'CancelAnimationFrame'] || window[prefix + 'CancelRequestAnimationFrame'];
    }

    if (!requestAnimationFrame || !cancelAnimationFrame) {
        window.requestAnimationFrame = function(fn, ele){
            var curTime = new Date().getTime(),
                timeToCall = Math.max(0, 50 / 3 - (curTime - lastTime)),
                id = setTimeout(fn, timeToCall);
            lastTime = curTime + timeToCall;
            return id;
        }
        window.cancelAnimationFrame = function(id){
            window.clearTimeout(id);
        }
    }

    function HtmlAnimation(){

    };
    window.htmlAnimation = HtmlAnimation;
}(window));
