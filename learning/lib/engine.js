/**
 * h5 canvas 游戏引擎
 *
 * #提供基础元素，容器，精灵，定时器，加载资源文件
 * #提供事件支持
 *
 * */
(function(){
    /* 大量常用js方法 */
    var _ = {
        extend : function(){
            var target = arguments[0],
                len = arguments.length,
                copy,
                deep = false,
                k,
                item,
                i = 1;
            if (typeof target === 'boolean') {
                deep = target;
                target = arguments[1];
                i++;
            }
            for (; i < len; i ++) {
                copy = arguments[i];
                if (copy) {

                }
            }
        },
        map : function(iter, fn){

        }
    };
    var requestAnimationFrame = window.requestAnimationFrame ? requestAnimationFrame : function(fn){
        return setTimeout(fn, 100 / 6);
    };
    var join = Array.prototype.join;
    var slice = Array.prototype.slice;
    var toString = Object.prototype.toString;
    Engine.isArray = Array.prototype.isArray || function(arr){
        return '[object Array]' === toString.apply(arr, []);
    };
    // ext
    Function.prototype.extend = function(opts){
        var p = new this();
        function child(){};
        child.prototype = $.extend({_super: this}, p, opts);
        return child;
    }
    // engine
    function Engine(canvas){
        if (!(this instanceof  Engine)) {
            return new Engine(canvas);
        }
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        // default style
        this.fillStyle = '#fff';
        this.strokeStyle = '#fff';
        this.lineWidth = 1;
        var buffer = document.createElement('canvas');
        this.bufferCtx = buffer.getContext('2d');
    }
    Engine.prototype = {
        setFillStyle : function(){
            if (arguments.length == 1) {
                this.ctx.fillStyle = arguments[0];
            } else if (arguments.length >= 3) {
                this.ctx.fillStyle = 'rgb(' + join.apply(arguments, [',']) + ')';
            }
        },
        setStrokeStyle : function(){
            if (arguments.length == 1) {
                this.ctx.fillStyle = arguments[0];
            } else if (arguments.length >= 3) {
                this.ctx.fillStyle = 'rgb(' + join.apply(arguments, [',']) + ')';
            }
        },
        moveTo : function(x, y){
            this.ctx.moveTo(x, y);
        },
        drawRect : function(){

        },
        drawImg : function(img, position){
           var w = this.canvas.width,
               y = this.canvas.height;
           if (typeof img === 'string') {
               var temp = new Image();
               temp.src = img;
               temp.onload = function(){
                   this.ctx.drawImage(temp, position.x, position.y, position.width, position.height);
               }
           } else {
               this.ctx.drawImage(img, position.x, position.y, position.width, position.height);
           }

        },
        getImageData : function(x, y, w, h){
            return this.ctx.getImageData(x, y, w, h);
        },
        putImageData : function(imageData, x, y){
            this.ctx.putImageData(imageData, x, y);
            return this;
        },
        clearAll : function(){
            this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);
            return this;
        }
    };
    Engine.Sprite = function(opts){
        if (!(this instanceof Engine.Sprite)) {
            return new Engine.Sprite(opts);
        }
        this.opts = $.extend({
            functions : {}
        }, opts);
        this.visible = false;
        this.width = 0;
        this.height = 0;
        return this;
    }
    Engine.Sprite.prototype = {

    };
    Engine.Sprite.extend = function(){

    };
    window.Engine = Engine;
}());