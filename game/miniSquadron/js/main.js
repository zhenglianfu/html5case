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
    };
    var player = Player();
    var bgCanvas = _id('bgCanvas'),
        containerCanvas = _id('containerCanvas'),
        directionCtrl = _id('directionCtrls'),
        w = document.body.clientWidth,
        h = document.body.clientHeight,
        mouseDown = false;
    containerCanvas.width = bgCanvas.width = w;
    containerCanvas.height = bgCanvas.height = h;
    directionCtrl.addEventListener('mousedown', function(e){
        e.preventDefault();
        mouseDown = true;
    });
    directionCtrl.addEventListener('mouseup', function(){
        mouseDown = false;
    });
    directionCtrl.addEventListener('mousemove', function(event){
        if (!mouseDown) {
            return;
        }
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
        $('.direction').css("transform", 'rotate(' + (rotation / Math.PI * 180 + 135) + 'deg)');
        var py = player.speed * Math.sin(rotation);
        var px = player.speed * Math.cos(rotation);
    }, false);
    // TODO resize ...

    // draw bg
    var bgPainter = Canvas2D(bgCanvas);
    var gradient  = bgPainter.getGradient(0, 0, 0, bgPainter.height);
    gradient.addColorStop(0, '#444').addColorStop(50 / bgPainter.height, '#666').addColorStop(100 / bgPainter.height, '#5bf').addColorStop(1, '#4af');
    bgPainter.rect(0,0,bgPainter.width,bgPainter.height);
    bgPainter.fill(gradient.getGradient());
})();