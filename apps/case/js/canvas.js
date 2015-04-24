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
    function drawCircle(cxt, point) {
        cxt.beginPath();
        cxt.arc(point.x, point.y, 15, 0, 4 * Math.PI);
        cxt.strokeStyle = '#509ef0';
        context.stroke();
        context.fillStyle = '#509ef0';
        context.fill();
    }
    var color = '#fff';
    // 重力球校准
    function drawGravityBall(x, y){
        var ctx = document.getElementById('gravity-canvas').getContext('2d');
        ctx.clearRect(0, 0, 240, 240);
        //校准线
        ctx.beginPath();
        ctx.arc(120, 114, 30, 1.1 * Math.PI, 1.9 * Math.PI, false);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(120, 114, 30, 0.1 * Math.PI,.9 * Math.PI, false);
        ctx.strokeStyle = color;
        ctx.lineWidth = 3;
        ctx.stroke();
        // 十字中心对准
        ctx.beginPath();
        ctx.moveTo(110, 114);
        ctx.lineTo(130, 114);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(120, 104);
        ctx.lineTo(120, 124);
        ctx.strokeStyle = color;
        ctx.stroke();
        //ball
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.arc(x, y, 20, 0, 2*Math.PI);
        ctx.fillStyle = '#ccc';
        ctx.fill();
    }
    if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', function(e){
            console.log(e);
            var alpha = Math.floor(e.alpha);
            var beta = Math.floor(e.beta);
            var gamma = Math.floor(e.gamma);
            if (beta > 90) {
                beta = 90;
            } else if (beta < -90) {
                beta = -90;
            }
            if (gamma > 90) {
                gamma = 90;
            } else if (gamma < -90) {
                gamma = -90;
            }
            var x = -(gamma / 90) * 88;
            var y = -(beta / 90) * 88;
            var z = Math.sqrt(x * x + y * y);
            // 最大偏移量
            if (z > 59) {
                x = x * 59 / z;
                y = y * 59 / z;
            }
            x = x + 120;
            y = y + 114;
            drawGravityBall(x, y);
        }, false);
    }
    drawGravityBall();
});
