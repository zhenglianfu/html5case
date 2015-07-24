/**
 * Created by zhenglianfu on 2015/5/24.
 * js color selector by css3
 * ie10+ chrome firefox ect. must be support CSS3
 */

// js颜色选择器
(function(){
    function ColorSelector(opts){
        if (!(this instanceof ColorSelector)) {
            return ColorSelector(opts);
        }
        this.$el = $(opts.el);
    }
    // functions
    ColorSelector.prototype = {
        _init : function(){

        }
    };
}());