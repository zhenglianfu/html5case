/**
 * h5 canvas 游戏引擎
 *
 * #提供基础元素，容器，精灵，定时器，加载资源文件
 * #提供事件支持
 * underscore
 * */
(function(){
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

    }
}());