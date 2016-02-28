/**
 * h5 canvas 游戏引擎
 *
 * #提供基础元素，容器，精灵，定时器，加载资源文件
 * #提供事件支持
 *
 * */
(function(){
    /* 大量常用js方法 */
    var classes = {};
    var core_slice = Array.prototype.slice;
    var core_concat = Array.prototype.concat;
    var core_toString = classes.toString;
    var _ = {
        isArray : Array.isArray || function(arr){
            return core_toString.apply(arr) === '[object Array]';
        },
        trim: String.prototype.trim ? function(str){
            return str.trim();
        } : function(str){
            return str.replace(rtrim, '');
        },
        extend : function(){
            var target = arguments[0],
                copy,
                len = arguments.length,
                i = 1,
                k, item,
                deep = false;
            if (typeof target === 'boolean') {
                deep = target;
                i ++;
                target = arguments[i];
            }
            for (;i < len; i++) {
                var item = arguments[i];
                if(item){
                    for(k in item){
                        copy = item[k];
                        if (typeof copy === 'object' && deep) {
                            if (Array.isArray(copy)) {
                                target[k] = _.extend(deep, [], copy);
                            } else {
                                target[k] = _.extend(deep, {}, copy);
                            }
                        } else if (copy != null) {
                            target[k] = copy;
                        }
                    }
                }
            }
            return target;
        },
        each : function(iter, fn){
            var len,
                i = 0;
            if (iter && (len = iter.length)) {
                for (; i < len; i++) {
                    fn && fn.call(iter[i], i, iter[i], iter);
                }
            }
        },
        map : function(iter, fn){
            var len,
                i = 0,
                res = [];
            if (iter && (len = iter.length)) {
                for(; i < len; i++){
                    res[i] = fn && fn.call(iter[i], i, iter[i], iter);
                }
                return res;
            }
        },
        type: function(x){
            return classes[core_toString.apply(x)];
        },
        proxy: function(fn, context, args){
            args = args || [];
            return function(){
                var arg_arr = core_slice.apply(arguments, [0]);
                fn.apply(context, core_concat.apply(arg_arr, args));
            };
        }
    };
    _.each('Object|Array|RegExp|Date|Number|Null|Undefined|Boolean|String', function(i, v){
        classes['[object ' + v + ']'] = v.toLowerCase();
    });
    function DumpEvent(){
        var event = document.createEvent('MouseEvents');
        event.initEvent('custom', true, true);
        return event;
    }
    var requestAnimationFrame = window.requestAnimationFrame ? window.requestAnimationFrame : function(fn){
        return setTimeout(fn, 100 / 6);
    };
    var cancelAnimationFrame = window.cancelAnimationFrame ? window.cancelAnimationFrame : function(id){
        return clearTimeout(id);
    };
    // engine
    function Engine(canvas){
        if (!(this instanceof  Engine)) {
            return new Engine(canvas);
        }
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.scaleY = 1;
        this.scaleX = 1;
        // default style
        this.fillStyle = '#fff';
        this.strokeStyle = '#fff';
        this.lineWidth = 1;
        var buffer = document.createElement('canvas');
        this.bufferCtx = buffer.getContext('2d');
        this.sprites = [];
        this.length = 0;
        this.soundChannels = [];
        this.soundChannels.length = 3;
        this.paused = false;
        this.running = null;
        this.allTime = 0;
        this.pauseTime = 0;
        this.startTime = 0;
        this._events = {};
        // bind user input event
        this._bindUserEvent();
    }
    Engine.handler_uuid = 0;
    Engine.requestAnimationFrame = function(fn){
        return requestAnimationFrame.call(window, fn);
    };
    Engine.cancelAnimationFrame  = function(id){
        return cancelAnimationFrame.call(window, id);
    };
    Engine.eventTypes = {
        start : 'start',
        end : 'end',
        run : 'run'
    };
    Engine.prototype = {
        resize: function(){
          this._resize();
        },
        preLoad: function(fn){
            var engine = this;
            var length = this.sprites.length;
            // call load of every sprite
            for (var i = 0; i < length; i++) {
                engine.sprites[i].loaded == false && engine.sprites[i].load();
            }
            // calculate loading status
            (function call(){
                var c = 0;
                for (var i = 0; i < length; i++) {
                    if (engine.sprites[i].loaded) {
                        c ++;
                    }
                }
                if (c == length) {
                    fn && fn();
                } else {
                    Engine.setTimeout(call, 100);
                }
            }());
        },
        _resize: function(){
            this.scaleX = this.canvas.width / this.originWidth;
            this.scaleY = this.canvas.height / this.originHeight;
        },
        _bindUserEvent : function(){
            var userEvents = 'click|mousedown|mouseup|mousemove|touchstart|touchend|touchmove|touchcancel|dbclick|drop|wheel|mousewheel'.split('|');
            for (var i = 0, len = userEvents.length; i < len; i++) {
                this.canvas.addEventListener(userEvents[i], _.proxy(this._dispatchUserInput, this));
            }
            document.body.addEventListener('keydown', _.proxy(this._dispatchUserInput, this));
            document.body.addEventListener('keyup', _.proxy(this._dispatchUserInput, this));
            window.addEventListener('resize', _.proxy(this._dispatchUserInput, this));
            window.addEventListener('resize', _.proxy(this._resize, this));
        },
        on : function(type, handler){
            this._events[type] = this._events[type] || [];
            if (handler) {
                handler.uuid = Engine.handler_uuid++;
                this._events[type].push(handler);
            }
        },
        getSprites : function(){
          return this.sprites;
        },
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
        },
        reset : function(){
            // TODO reset
        },
        _hasSprite : function(sprite){
            if (sprite) {
                for (var i = 0, len = this.sprites.length; i < len; i++) {
                    if (sprite.id === this.sprites[i].id) {
                        return i;
                    }
                }
            }
            return -1;
        },
        addSprite: function(sprite){
            // TODO sort by index
            if (sprite instanceof Engine.Sprite && this._hasSprite(sprite) === -1) {
                this.sprites.push(sprite);
                this.length = this.sprites.length;
                // trigger addToStage
                sprite.trigger('addToStage');
            }
            return this;
        },
        putSprite: function(sprite){
            return this.addSprite(sprite);
        },
        removeAllSprite: function(){
            this.sprites = [];
            this.length = 0;
        },
        removeSprite: function(sprite){
            var index;
            if (sprite instanceof Engine.Sprite && (index = this._hasSprite(sprite)) > -1) {
                this.sprites.splice(index, 1);
                this.length = this.sprites.length;
            }
        },
        replaceSprite: function(oldSp, newSp){
            if (oldSp instanceof Engine.Sprite && newSp instanceof Engine.Sprite) {
                var index = this._hasSprite(oldSp);
                if (~index) {
                    this.sprites[index] = newSp;
                }
            }
            return this;
        },
        deleteSprite: function(sprite){
            var index;
            if (sprite instanceof Engine.Sprite && (index = this._hasSprite(sprite)) > -1) {
                this.sprites.splice(index, 1);
                this.length = this.sprites.length;
            }
        },
        draw: function(){
            // clear first
            this.clearAll();
            // engine's resource
            // sprites on this engine
            for (var i = 0, len = this.sprites.length; i < len; i++) {
                var sprite = this.sprites[i];
                this.ctx.save();
                sprite.draw(this.ctx, null);
                this.ctx.restore();
            }
        },
        start: function(){
            var engine = this;
            engine.running = true;
            engine.paused = false;
            this.startTime = new Date().getTime();
            this._run(this);
            this._eventTrigger({type: 'start'});
        },
        _eventTrigger: function(event){
            var handlers = this._events[event.type];
            if (handlers) {
                for (var i = 0, len = handlers.length; i < len; i++) {
                    handlers[i].apply(this, arguments);
                }
            }
        },
        _run: function(engine){
            (function loop(){
                engine.draw();
                engine.timer = engine.running && !engine.paused && requestAnimationFrame(function(){
                    loop();
                });
            }());
        },
        end : function(){
            cancelAnimationFrame(this.timer);
            this.running = false;
            this._eventTrigger({type: 'end'});
        },
        pause : function(){
            this.paused = true;
            cancelAnimationFrame(this.timer);
        },
        resume : function(){
            this.paused = false;
            this._run(this);
        },
        isEnd: function(){
            return this.running == false;
        },
        _dispatchUserInput: function(e){
            if (this.paused || this.running == false) {
                //return false;
            }
            var type = e.type.toLowerCase();
            var len = this.sprites.length;
            var callList = [];
            // displath to all sprite who register
            if (~['keyup', 'keydown', 'resize'].indexOf(type)) {
                for (var i = 0; i < len; i++) {
                   this.sprites[i].visible && this.sprites[i].trigger(type, e);
                }
            } else if (~['click','dbclick', 'wheel', 'mousewheel', 'mousedown','mouseup','mousemove','touchstart','touchmove', 'touchend', 'touchcancel', 'drop'].indexOf(type)) {
                var position = {};
                if (/touch/.test(type)){
                    position = [];
                    var touchs = e.changedTouches;
                    var elen = touchs.length;
                    for (var i = 0; i < elen; i++) {
                        position[i] = this._offsetEventPosition(touchs[i].clientX, touchs[i].clientY);
                    }
                } else {
                    position = this._offsetEventPosition(e.clientX, e.clientY);
                }
                for (var i = 0; i < len; i++) {
                    if (this.sprites[i].visible && this._isInSpritePath(this.sprites[i], position)){
                        callList.push(this.sprites[i]);
                    };
                }
                for (i = 0, len = callList.length; i < len; i+=1) {
                    callList[i].trigger(type, e);
                }
            }
        },
        _isInSpritePath: function(sprite, point){
            // TODO consider scale
            var x = this.scaleX * sprite.point.x;
            var y = this.scaleY * sprite.point.y;
            var w = this.scaleX * sprite.width;
            var h = this.scaleY * sprite.height;
            if (_.isArray(point)) {
                for (var i = 0, len = point.length; i < len; i++) {
                    var px = point[i].x;
                    var py = point[i].y;
                    if (px >= x && px <= x + w && py >= y && py <= y + h) {
                        return true;
                    }
                }
            } else {
                return point.x >= x && point.x <= x + w && point.y >= y && point.y <= y + h;
            }
            return false;
        },
        _offsetEventPosition: function(clientX, clientY){
            var scrollTop = window.pageYOffset || window.scrollY || document.body.scrollTop;
            var scrollLeft = window.pageXOffset || window.scrollX || document.body.scrollLeft;
            var offsetLeft = this.canvas.offsetLeft;
            var offsetTop = this.canvas.offsetTop;
            var offsetEl = this.canvas;
            while((offsetEl = offsetEl.offsetParent)){
                offsetLeft += offsetEl.offsetLeft;
                offsetTop += offsetEl.offsetTop;
            }
            return {
                x : clientX + scrollLeft - offsetLeft,
                y : clientY + scrollTop - offsetTop
            }
        },
        setViewportWidth: function(w){
            if (typeof w === 'number') {
                w = w + 'px';
            }
            this.canvas.style.width = w;
            return this;
        },
        setViewportHeight: function(h){
            if (typeof h === 'number') {
                h = h + 'px';
            }
            this.canvas.style.height = h;
            return this;
        },
        setStageWidth: function(w){
            this.canvas.width = w;
            return this;
        },
        setStageHeight: function(h){
            this.canvas.height = h;
        },
        getStageHeight: function(){
            return this.canvas.height;
        },
        getStageWidth: function(){
            return this.canvas.width;
        }
    };

    // sprite def
    Engine.Sprite = function(opts){
        if (!(this instanceof Engine.Sprite)) {
            return new Engine.Sprite(opts);
        }
        this.children = [];
        this.opts = _.extend({
            name : 'ghost',
            imgSrc : '',
            videoSrc : '',
            audioSrc : '',
            load : function(){},
            text : '',
            resType: ''
        }, opts);
        this.eventsHandler = {};
        var load = this.opts.load;
        this.opts.load = function(){
            if (this.opts.resType == 'img') {
                this.width = this.image.width;
                this.height = this.image.height;
            }
            load.apply(this, arguments);
        };
        this.name = this.opts.name;
        this.visible = false;
        this.id = this.name + '_' + (new Date().getTime() + Engine.Sprite.sp_uuid++);
        this.width = this.opts.width;
        this.height = this.opts.height;
        this.point = {
            x : 0,
            y : 0
        };
        this.rotate = 0;
        this.lifeEnd = false;
        this.visible = true;
        this.loaded = false;
        this.init();
        return this;
    };
    // sprite generate uuid, make sure (new Sprite).id is unique
    Engine.Sprite.sp_uuid = 0;
    Engine.Sprite.prototype = {
        on: function(type, handler){
            var types = type.split(',');
            for (var i = 0; i < types.length; i ++) {
                type = _.trim(types[i]);
                this.eventsHandler[type] = this.eventsHandler[type] || [];
                handler.uuid = handler.uuid == null ? Engine.event_handler_uuid++ : handler.uuid;
                this.eventsHandler[type].push(handler);
            }
        },
        off : function(type, handler){
            switch (arguments.length) {
                case 1:
                    this.eventsHandler[type] = [];
                    break;
                case 2:
                    var handlers = this.eventsHandler[type];
                    if (handlers && handlers.indexOf(handler) > -1) {
                        handlers.splice(handlers.indexOf(handler), 1);
                    }
                    break;
                default :
            }
        },
        trigger: function(type, event){
            var handlers = this.eventsHandler[type];
            if (handlers && handlers.length) {
                for (var i = 0, len = handlers.length; i < len; i++) {
                    handlers[i].call(this, event || DumpEvent());
                }
            }
        },
        init: function(){
            if (this.opts.imgSrc) {
                this.opts.resType = 'img';
                this.image = new Image;
            } else if (this.opts.audioSrc) {
                this.opts.resType = 'audio';
                this.audio = document.createElement('audio');
            } else if (this.opts.videoSrc) {
                this.opts.resType = 'video';
                this.video = document.createElement('video');
            } else {
                this.opts.resType = 'text';
                this.text = this.opts.text;
                this.loaded = true;
            }
        },
        setTexture: function(data){
            if (typeof data == 'string') {
                this.opts.resType = 'text';
                this.text = this.opts.text = data;
            } else if (data instanceof window.HTMLImageElement) {
                this.opts.resType = 'img';
                this.image = data;
                this.width = data.width;
                this.height = data.height;
            }
            this.loaded = true;
        },
        load: function(){
            if (this.loaded) {
                return;
            }
            var sprite = this;
            var args = arguments;
            var onloadProxy = function(){
                sprite.loaded = true;
                sprite.opts.load.apply(sprite, args);
            };
            // resource type
            var type = this.opts.resType;
            switch (type){
                case 'img' :
                    this.image.onload = onloadProxy;
                    this.image.src = this.opts.imgSrc;
                    break;
                case 'video':
                    this.video.onload = onloadProxy;
                    this.video.src = this.opts.videoSrc;
                    break;
                case 'sound':
                    this.audio.onload = onloadProxy;
                    this.audio.src = this.opts.audioSrc;
                    break;
                default :
                    this.text = this.opts.text;
                    break;
            }
        },
        draw : function(ctx, stage){
            ctx.globalAlpha = this.opts.alpha || 1;
            stage = stage || {
                point: {x: 0, y: 0}
            };
            if (this.visible == false || this.lifeEnd == true) {
                return;
            }
            ctx.save();
            ctx.translate((this.point.x + stage.point.x + this.width / 2), (this.point.y + stage.point.y + this.height / 2));
            ctx.rotate(this.rotate);
            ctx.translate(-(this.point.x + stage.point.x + this.width / 2), -(this.point.y + stage.point.y + this.height / 2));
            var type = this.opts.resType;
            var sprite = this;
            if (this.loaded == false) {
                // auto call load function
                sprite.load();
                setTimeout(function(){
                    sprite.draw(ctx, stage);
                }, 50);
                return;
            }
            switch (type){
                case 'img':
                    ctx.drawImage(this.image, this.point.x + stage.point.x, this.point.y + stage.point.y, this.width, this.height);
                    break;
                case 'sound':
                    if (this.audio) {
                        this.audio.play();
                    }
                    break;
                case 'video':
                    // draw image
                    if (this.video) {

                    }
                    break;
                case 'text':
                    ctx.font = this.opts.font || '1rem';
                    if (this.opts.strokeStyle) {
                        ctx.strokeStyle = this.opts.strokeStyle;
                        ctx.lineWidth  = this.opts.strokeWidth || 0;
                        ctx.strokeText(this.text, this.point.x + stage.point.x, this.point.y + stage.point.y);
                    }
                    ctx.fillStyle = this.opts.fillStyle || '#000';
                    ctx.fillText(this.text, this.point.x + stage.point.x, this.point.y + stage.point.y);
                    break;
            }
            ctx.restore();
            if (this.children.length) {
                for (var i = 0, len = this.children.length; i < len; i += 1) {
                    this.children[i].draw(ctx, sprite);
                }
            }
        },
        set : function(key, value){
        	if (typeof key === 'object') {
        		for (var i in key) {
        			value = key[i];
        		}
        	} else if (key && value) {
        		this.opts[key] = value;
        	}
        	return this;
        },
        setVisible: function(visible){
            this.visible = visible;
        },
        getVisible: function(){
            return this.visible;
        },
        addChild: function(sprite){
            if (this.childSpriteIndex(sprite) == -1) {
                sprite.stage = this;
                this.children.push(sprite);   
            }
        },
        childSpriteIndex: function(sprite){
            for (var i = 0, len = this.children.length; i < len; i++) {
                if (this.children[i].id == sprite.id) {
                    return i;
                }
            }
            return -1;
        },
        removeSprite: function(sprite){
            var index;
            if (index = this.childSpriteIndex(sprite) > -1) {
                this.children.splice(index, 1);
                this.length = this.children.length;
            }
        }
    };
    Engine.Sprite.extend = function(){
    	
    };
    window.Engine = Engine;
}());