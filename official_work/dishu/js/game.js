/**
 * Created by Administrator on 2015/7/17.
 */


(function(){
    var points = [86, 222, 256, 210, 418, 210, 100, 390, 260, 380, 420, 370, 90, 533, 270, 533, 430, 523];
    var lockPoint = [];
    var hmSprites = [];
    var lockSprites = [];
    var canvas = document.getElementById('game');
    var engine = initEngine();
    var resources = [
        './image/bg.png',
        './image/fukuang.png',
        './image/guize.png',
        './image/light.png',
        './image/lock.png',
        './image/play.png',
        './image/playagain.png',
        './image/renwu1.png',
        './image/renwu2.png',
        './image/score.png',
        './image/share.png',
        './image/zhanji.png'
    ];
    // Resources
    function preLoad(fn){
        var i = 0,
            len = resources.length,
            count = 0,
            countFn = function(){
                count ++;
                if (count >= len) {
                    fn();
                }
            };
        for (; i < len; i++) {
            var img = new Image;
            img.onload = img.onerror = countFn;
            img.src = resources[i];
        }
    }
    // UI
    function resize(){
        var el = document.getElementById('wrap');
        var canvas = document.getElementById('game');
        canvas.width = el.clientWidth;
        canvas.height = el.clientWidth * 1.5;
        engine.resize();
    };

    function initEngine(){
        var engine = Engine(document.getElementById('game'), 621, 1008);
        engine.start();
        return engine;
    }

    preLoad(function(){
        // after load all resources
        engine.addSprite(Engine.Sprite({
            name: 'bg',
            imgSrc: './image/bg.png'
        }));
        for (var i = 0; i < 9; i++) {
            hmSprites[i] = Engine.Sprite({
                name: '',
                imgSrc: '',
                visible: false,
                x: points[i * 2],
                y: points[i * 2 + 1]
            });
            lockSprites[i] = Engine.Sprite({
                name: 'lock',
                imgSrc: './image/lock.png',
                visible: false,
                x: points[i * 2],
                y: points[i * 2 + 1]
            });
        }
        engine.addSprite(hmSprites);
        engine.addSprite(lockSprites);
        var start = new Date().getTime();
        var space = 3000;
        var num = 1;
        var rate = 0.3;
        (function reDraw(){
            var spend = new Date().getTime() - start;
            // set visible = false
            for (var i = 0; i < 9; i++) {
                hmSprites[i].visible = false;
            }
            for (var i = 0; i < num; i++) {
                var isEvil = Math.random() > 0.7;
                var index = (Math.random() * 9) >> 0;
                lockSprites[i].visible = hmSprites[index].visible = true;
            }
        }())
    });
    window.engine = engine;
    window.onresize = resize;
    resize();
}());