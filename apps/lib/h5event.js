/* only for mobile event */
/* webkit chrome safari */
(function(){
    var mTouchEvent = function mTouchEvent(){
        var uid = 0;
        return {
            addEvent: function($0, type, handler, captrue){
                $0.addEventListener(type, handler, captrue);
            },
            removeEvent: function($0, type, handler, captrue){
                $0.removeEventListener(type, handler, captrue);
            }
        };
    }();
    var foo = function(){};
    var Wipe = function($el, opts){
        if (!(this instanceof Wipe)) {
            return new Wipe($el, opts);
        }
        this.width = $el.clientWidth;
        this.height = $el.clientHeight;
        this.$el = $el;
        this.pressed = false;
        this.pressedTimer = null;
        this.rubTimer = null;
        this.opts = $.extend({
            scaleIn : foo,
            scaleOut : foo,
            up : foo,
            rotate : foo,
            down : foo,
            left : foo,
            right : foo,
            press : foo,
            rub : foo,
            kiss : foo,
            shake : foo,
            rotateLeft : foo,
            rotateRight : foo
        },opts);
        this.init();
        this.rubLength = 0;
        this.touchLength = 0;
        this.points = [];
        this.currentPoint = {};
        this.startPoint = {};
        this.acceleratorX = 0;
        this.acceleratorY = 0;
        this.acceleratorZ = 0;
        this.acceleratorTimestamp = 0;
    };
    Wipe.prototype = {
        _bindEvent: function(){
            var that = this;
            mTouchEvent.addEvent(this.$el, 'touchstart', function(e){
                that.startProxy(e);
            });
            mTouchEvent.addEvent(this.$el, 'touchend', function(e){
                that.endProxy(e);
            });
            mTouchEvent.addEvent(this.$el, 'touchmove', function(e){
                that.moveProxy(e);
            });
            mTouchEvent.addEvent(this.$el, 'touchcancel', function(e){
                that.cancelProxy(e);
            });
            if (window.DeviceMotionEvent) {
                window.addEventListener('devicemotion', function(e){
                   that.motionProxy(e);
                });
            }
        },
        startProxy : function(e){
            e.preventDefault();
            var changed = e.changedTouches[0];
            var that = this;
            var curr = this.startPoint = this.currentPoint = {
                x : changed.clientX,
                y : changed.clientY
            };
            this.touchLength = e.touches.length;
            for (var i = 0, len = e.touches.length; i < len; i++) {
                var event = e.touches[i];
                this.points.push({
                    x : event.clientX,
                    y : event.clientY
                });
            }
            this.startPressTimer(e);
        },
        endProxy : function(e){
            e.preventDefault();
            this.clearPressTimer();
            var change = e.changedTouches[0];
            this.currentPoint = {
                x : change.clientX,
                y : change.clientY
            };
            this.points = [];
            this.touchLength = e.touches.length;
            for (var i = 0, len = this.touchLength; i < len; i++) {

            }
            var point = {
                x : change.clientX,
                y : change.clientY
            };
            if (this.isDown(this.startPoint, point)) {
                this.opts.down(e);
            }
            if (this.isUp(this.startPoint, point)) {
                this.opts.up(e);
            }
            if (this.isLeft(this.startPoint, point)) {
                this.opts.left(e);
            }
            if (this.isRight(this.startPoint, point)) {
                this.opts.right(e);
            }
        },
        moveProxy : function(e){
            e.preventDefault();
            this.clearPressTimer();
            this.startPressTimer(e);
            this.clearRubTimer(e);
            this.startRubTimer(e);
            var change = e.changedTouches[0];
            var curr = {
                x : change.clientX,
                y : change.clientY
            };
            this.rubLength += this.distance(curr, this.currentPoint);
            if (this.isRub(this.rubLength)) {
                this.opts.rub(e);
            }
            this.currentPoint = curr;
        },
        cancelProxy : function(e){
            e.preventDefault();
            this.clearPressTimer();
        },
        motionProxy : function(e){
            var delta;
            var timestamp = new Date().getTime();
            if (this.acceleratorTimestamp == 0) {
                this.acceleratorTimestamp = timestamp;
            }
            var acceleration = e.accelerationIncludingGravity; // 重力参数
            var diffTime = timestamp - this.acceleratorTimestamp;
            var x = acceleration.x,
                y = acceleration.y,
                z = acceleration.z;
            // 间隔2帧处理一次
            if (diffTime > 100 / 3) {
                if ((delta = this.isRotateLeft(x, y, z)) > 0) {
                    this.opts.rotateLeft(e, Math.abs(delta));
                }
                if ((delta = this.isRotateRight(x, y, z)) > 0) {
                    this.opts.rotateRight(e, Math.abs(delta));
                }
            }
            // 间隔100ms处理一次
            if (diffTime > 100) {
                this.acceleratorTimestamp = timestamp;
                var speed = Math.abs(x + y + z - this.acceleratorX - this.acceleratorY - this.acceleratorZ) / diffTime * 100;
                if (this.isShake(speed)) {
                    // speed is 10~50+
                    this.opts.shake(e, speed/10);
                }
            }
            this.acceleratorX = x;
            this.acceleratorY = y;
            this.acceleratorZ = z;
        },
        clearPressTimer : function(){
            this.pressed = false;
            clearTimeout(this.pressedTimer);
        },
        startRubTimer : function(){
            var that = this;
            this.rubTimer = setTimeout(function(){
                that.rubLength = 0;
            }, 50 / 3);
        },
        clearRubTimer : function(){
            clearTimeout(this.rubTimer);
        },
        startPressTimer : function(e){
            var that = this;
            this.pressedTimer = setTimeout(function(){
                that.pressed = true;
                that.opts.press(e);
            }, 2000);
        },
        init : function(){
            this._bindEvent();
            this._bindEvent = foo;
        },
        isUp: function(startPoint, endPoint){
            var delta = startPoint.y - endPoint.y;
            return delta > 0 && delta > 1.2 * Math.abs(startPoint.x - endPoint.x);
        },
        isDown: function(startPoint, endPoint){
            var delta = endPoint.y - startPoint.y;
            return delta > 0 && delta > 1.2 * Math.abs(startPoint.x - endPoint.x);
        },
        isLeft : function(startPoint, endPoint){
            var delta = startPoint.x - endPoint.x;
            return delta > 0 && delta > 1.2 * Math.abs(startPoint.y - endPoint.y);
        },
        isRight : function(startPoint, endPoint){
            var delta = endPoint.x - startPoint.x;
            return delta > 0 && delta > 1.2 * Math.abs(startPoint.y - endPoint.y);
        },
        isPress: function(){
            return this.pressed;
        },
        isRub : function(d){
            return d > Math.max(this.width, this.height) / 2;
        },
        isKiss : function(){

        },
        isScaleout : function(startPoints, endPoints){

        },
        isScaleIn : function(startPoints, endPoints){

        },
        isShake : function(speed){
            return speed > 10;
        },
        isRotateLeft: function(x, y, z){
            var angle = window.orientation || 0;
            if (angle == 0 && x > 0) {
                return x;
            } else if (angle == 90 && y < 0) {
                return Math.abs(y);
            } else if (angle == -90 && y > 0) {
                return  y;
            }
            return 0;
        },
        isRotateRight: function(x, y, z){
            var angle = window.orientation || 0;
            if (angle == 0 && x < 0) {
                return Math.abs(x);
            } else if (angle == 90 && y > 0) {
                return y;
            } else if (angle == -90 && y < 0) {
                return Math.abs(y);
            }
            return 0;
        },
        flip : function () {
            var angle = window.orientation || 0;
        },
        setHandler : function(type, handler){

        },
        removeHandler : function(type){

        },
        distance : function(f, t){
            var x = f.x - t.x;
            var y = f.y - t.y;
            return Math.sqrt(Math.pow(x,2) + Math.pow(y, 2));
        }
    };
    window.Wipe = Wipe;
}());
