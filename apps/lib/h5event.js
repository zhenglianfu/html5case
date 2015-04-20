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
    };
    var foo = function(){};
    var wipe = function($el, opts){
        this.$el = $0;
        this.opts = $.extend({
            up : foo,
            down : foo,
            left : foo,
            right : foo,
            press : foo,
            rub : foo,
            kiss : foo,
            shake : foo
        },opts);
        this.init();
        this.originX = 0;
        this.originY = 0;
    };
    wipe.prototype = {
        init : function(){

        },
        isUp: function(){

        },
        isDown: function(){

        },
        isLeft : function(){

        },
        isRight : function(){

        },
        isPress: function(){

        },
        isRub : function(){

        },
        isKiss : function(){

        },
        isShake : function(){

        },
        setHandler : function(){

        }
    };
});
