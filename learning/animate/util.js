/**
 * Created by zhenglianfu on 2015/4/27.
 */
// requestAnimationFrame
window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.msRequestAnimationFrame || function(fn){
    return setTimeout(fn, 100 / 6);
};
window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelRequestAnimationFrame || window.mozCancelRequestAnimationFrame || window.msCancelRequestAnimationFrame || clearTimeout
var util= {};
util.captureMouse = function(element){
    var mouse = {
        x : 0,
        y : 0
    };
    element.addEventListener('mousemove', function(event){
        var x, y;
        if (event.pageY || event.pageX) {
            x = event.pageX;
            y = event.pageY;
        } else {
            x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        x -= element.offsetLeft;
        y -= element.offsetTop;
        mouse.x = x;
        mouse.y = y;
    }, false);
    return mouse;
};
//touch on mobile
util.captureTouch = function(element){
    var touch = {
        x : 0,
        y : 0,
        isPressed: false
    };
    element.addEventListener('touchstart', function(){
        touch.isPressed = true;
    }, false);

    element.addEventListener('touchend', function(){
        touch.isPressed = false;
        touch.x = null;
        touch.y = null;
    }, false);
    element.addEventListener('touchmove', function(event){
        var x, y, touch_event = event.touches[0];
        if (touch_event.pageX || touch_event.pageY) {
            x = touch_event.pageX
            y = touch_event.pageY;
        } else {
            x = touch_event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = touch_event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        x -= element.offsetLeft;
        y -= element.offsetTop;
        touch.x = x;
        touch.y = y;
    }, false);
    return touch;
};

util.parseColor = function(color){
    if (color.indexOf('#') > -1) {
        return color;
    }
    return color;
}