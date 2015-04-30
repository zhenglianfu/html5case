/**
 * Created by Administrator on 2015/4/30.
 */
(function(){
    var _id = function(id){
        return document.getElementById(id);
    };
    var getOffset = function(ele){
        var top = ele.offsetTop,
            left = ele.offsetLeft,
            parent = ele;
        while((parent = parent.offsetParent)){
            top += parent.offsetTop;
            left += parent.offsetLeft;
        }
        return {
            top: top,
            left : left
        }
    }
    var bgCanvas = _id('bgCanvas'),
        containerCanvas = _id('containerCanvas'),
        directionCtrl = _id('directionCtrls'),
        w = document.body.clientWidth,
        h = document.body.clientHeight;
    containerCanvas.width = bgCanvas.width = w;
    containerCanvas.height = bgCanvas.height = h;
    directionCtrl.addEventListener('mousemove', function(event){
        var x, y;
        if (event.pageX || event.pageY) {
            x = event.pageX;
            y = event.pageY;
        } else {
            x = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            y = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }
        var offset = getOffset(directionCtrl),
            dx = x - (offset.left + 40),
            dy = y - (offset.top + 40 ),
            rotation = Math.atan2(dy, dx);
    }, false);
})();