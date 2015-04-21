/**
 * Created by Administrator on 2015/4/20.
 */
PManager.load('zepto', function(data, error){
    var $ = data.zepto;
    // start
    console.log('start engine');
    var width = document.body.clientWidth;
    var canvasPanel = $('#circle-panel')[0];
    canvasPanel.width = width - 2;
    var r = 10;
    var offset = {
        top : canvasPanel.offsetTop,
        left : canvasPanel.offsetLeft
    };
    var context = canvasPanel.getContext('2d');
    var getPageOffset = function(){
        return {
            top : window.pageYOffset || document.documentElement.offsetTop,
            left : window.pageXOffset || document.documentElement.offsetLeft
        };
    };
    canvasPanel.addEventListener('touchstart', function(e){
        e.preventDefault();
        var points = e.touches,
            event, x, y, pageOffset = getPageOffset();
        //clear(context);
        for (var i = 0, len = points.length; i < len; i++) {
            event = points[i];
            x = event.clientX + pageOffset.left - offset.left;
            y = event.clientY + pageOffset.top - offset.top;
            drawCircle(context, {
                x : x,
                y : y
            });
        }
    });
    canvasPanel.addEventListener('touchmove', function(e){
        e.preventDefault();
        var points = e.touches,
            event, x, y, pageOffset = getPageOffset();
        //clear(context);
        for (var i = 0, len = points.length; i < len; i++) {
            event = points[i];
            x = event.clientX + pageOffset.left - offset.left;
            y = event.clientY + pageOffset.top - offset.top;
            drawCircle(context, {
                x : x,
                y : y
            });
        }
    });
    canvasPanel.addEventListener('touchend', function(){

    });
    function clear(ctx){
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }
    function drawCircle(cxt, point){
        cxt.beginPath();
        cxt.arc(point.x, point.y, 15, 0, 4 * Math.PI);
        cxt.strokeStyle = '#509ef0';
        context.stroke();
        context.fillStyle = '#509ef0';
        context.fill();
    }
});