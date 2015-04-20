// 返回t时刻物体的移动距离
var tween;
(function(m){
    var squareDeg = m.PI / 2; // 90度，直角
    var PI = m.PI;
    var square = function(num){
      return m.pow(num, 2);
    };
    var cube = function(num){
        return m.pow(num, 3);
    };
    var sin = function(deg){
        return m.sin(deg);
    };
    var cos = function(deg){
        return m.cos(deg);
    };
    tween = {
        linear : function(from, to, duration, t){
            return t / duration * (from - to);
        },
        easeOut: function(from, to, duration, t){
            return square(sin(squareDeg * (t / duration))) * (from - to);
        },
        easeInOut: function(){

        }
    };
}(Math));