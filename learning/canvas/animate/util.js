"use strict"
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

// color to number
util.parseColor = function(color, number){
    var base = 10;
    if (typeof color == 'number') {
        if (number) {
            return color;
        }
        color = '#' + color.toString(16);
    }
    if (color.indexOf('#') == 0) {
        base = 16;
        color = color.substr(1);
    } else if (color.indexOf('rgba') == 0) {
        color = color.replace('rgba(', '').replace(')', '');
        color = color.substr(0, color.lastIndexOf(','));
    } else if (color.indexOf('rgb') == 0) {
        color = color.replace('rgb(', '').replace(')', '');
    }
    if (color.length == 3) {
        color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
    }
    if (base == 16) {
        color = window.parseInt(color, base);
    } else {
        var rgb = color.split(',');
        color = (window.parseInt(rgb[0]) << 16 & 0xff0000) + (window.parseInt(rgb[1]) << 8 & 0xff00) + window.parseInt(rgb[2]);
    }
    if (number) {
        return color;
    } else {
        var rgb = [];
        rgb[0] = color >> 16 & 0xff;
        rgb[1] = color >> 8 & 0xff;
        rgb[2] = color & 0xff;
        return rgb;
    }
    return color;
};

util.colorToRGB = function(color, alpha){
    if (color[0] == '#') {
        color = color.substr(1);
        if (color.length == 3) {
            color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
        }
    } else if (color.indexOf('rgb') == 0) {
        return color;
    }
    color = window.parseInt(color, 16);
    var r = color >> 16 & 0xff,
        g = color >> 8 & 0xff,
        b = color & 0xff;
    if (alpha != undefined) {
        return 'rgba(' + r + ',' + g + ',' + b + ',' +  a + ')';
    } else {
        return 'rgb(' + r + ',' + g + ',' + b + ')';
    }
};

// element of canvas
util.Canvas = function(canvas){
    if (typeof canvas == 'string') {
        canvas = window.document.getElementById(canvas);
    }
    return {
        canvas: canvas,
        context: canvas.getContext('2d')
    }
}