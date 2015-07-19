/**
 * Created by Administrator on 2015/7/17.
 */


(function(){
    var childPoints = [100,260,265,250,435,238,100,440,274,440,444,430,116,604,280,604,446,597];
    var evilPoints =  [100,240,277,230,437,220,110,424,290,419,455,413,120,587,295,582,455,576];
    var lockPoints =  [120,250,280,250,450,250,120,450,300,450,460,450,120,610,310,610,460,596];
    var humanSprites = [];
    var lockSprites = [];
    var canvas = document.getElementById('game');
    var originWidth = 621;
    var originHeight = 1008;
    var score = 0;
    var scoreSprite = null;
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
    var startTime = new Date().getTime();
    var space = 1000;
    var num = 1;
    var gameMilliseconds = 30000;
    var evilRate = 0.3;
    var drawTimer = null;
    var numIncreaseTimer = null;
    var spaceMinusTimer = null;
    var gameTimeTimer = null;
    var secondTextTimer = null;
    var secondTextSprite = null;
    var timeProcessSprite = null;
    var score = 0;
    var scoreSprite = null;
    var timeProcessWidth = 450;
    var timeProcessHeight = 30;
    var evilRectangle = {
        width: 118,
        height: 146
    };
    var evilImg = new Image;
    evilImg.src = './image/renwu2.png';
    var childRectangle = {
        width: 122,
        height: 124
    };
    var childImg = new Image;
    childImg.src = './image/renwu1.png';
    var engine = initEngine();
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
        canvas.height = el.clientWidth * 1.624;
        engine.resize();
    };

    function initEngine(){
        var engine = Engine(document.getElementById('game'), originWidth, originHeight);
        return engine;
    }
    function restore(){
        startTime = new Date().getTime();
        space = 3000;
        num = 1;
        score = 0;
        secondTextSprite.text = gameMilliseconds / 1000 + '\'s';
        timeProcessSprite.width = timeProcessWidth;
    }
    function end(){
        secondTextSprite.text = '0\'s';
        engine.draw();
        engine.end();
        Engine.clearTimeout(drawTimer);
        Engine.clearTimeout(numIncreaseTimer);
        Engine.clearTimeout(spaceMinusTimer);
        Engine.clearTimeout(gameTimeTimer);
        Engine.clearTimeout(secondTextTimer);
    }

    function touchListener(e){
        console.log(this.name, this.opts.index, e.clientX, e.clientY);
    }

    function start(){
        var seconds = gameMilliseconds / 1000;
        var timerSeconds = seconds;
        var timeProcessMinusWidth = timeProcessWidth / (seconds * 60);
        restore();
        (function reDraw(){
            var spend = new Date().getTime() - startTime;
            // set visible = false
            for (var i = 0; i < 9; i++) {
                humanSprites[i].visible = false;
                lockSprites[i].visible = false;
            }
            for (var i = 0; i < num; i++) {
                var isEvil = Math.random() > 0.7;
                var index = (Math.random() * 9) >> 0;
                var sprite = humanSprites[index];
                if (isEvil) {
                    sprite.image = evilImg;
                    sprite.name = 'evil';
                    sprite.point = {
                        x : evilPoints[index * 2],
                        y : evilPoints[index * 2 + 1]
                    };
                    sprite.width = evilRectangle.width;
                    sprite.height = evilRectangle.height;
                    lockSprites[index].visible = false;
                } else {
                    sprite.image = childImg;
                    sprite.name = 'child';
                    sprite.point = {
                        x : childPoints[index * 2],
                        y : childPoints[index * 2 + 1]
                    };
                    sprite.width = childRectangle.width;
                    sprite.height = childRectangle.height;
                    lockSprites[index].visible = true;
                }
                sprite.visible = true;
            }
            drawTimer = Engine.setTimeout(reDraw, space);
        }());
        (function loop(){
            num += 1;
            numIncreaseTimer = Engine.setTimeout(loop, gameMilliseconds / 5);
        }());
        (function loop(){
            space /= 1.2;                                                                                                   ;
            spaceMinusTimer = Engine.setTimeout(loop, gameMilliseconds / 5);
        }());
        (function loop(){
            // ¶ÁÃë
            timeProcessSprite.width -= timeProcessMinusWidth;
            gameTimeTimer = Engine.setTimeout(loop);
        }());
        (function loop(){
            secondTextSprite.text = (timerSeconds--) + '\'s';
            secondTextTimer = Engine.setTimeout(loop, 1000);
        }());
        Engine.setTimeout(function(){
            end();
        }, gameMilliseconds);
        engine.start();
    }

    function addEvent(){
        $('#startBtn, #restartBtn').bind('click', function(){
            $('#startSection').remove();
            start();
        });
    }

    function addBlock(){
        var index = (Math.random() * humanSprites.length) >> 0;
        while(humanSprites[index].visible == false) {
            var sprite = humanSprites[i];

        }
    }

    function calculateIsEvilSprite(){
        return Math.random() > (1 - evilRate);
    }

    preLoad(function(){
        addEvent();
        // after load all resources
        engine.addSprite(Engine.Sprite({
            name: 'bg',
            imgSrc: './image/bg.png'
        }));
        engine.addSprite(Engine.Sprite({
            name: 'score',
            imgSrc: './image/score.png',
            x: 214,
            y: 80
        }));
        scoreSprite = Engine.Sprite({
            name: 'scoreText',
            resType: 'text',
            text: '0',
            fillStyle: '#fff',
            font: 'normal normal 30px "Microsoft YaHei", "STHeiti Light", sans-serif',
            x: 348,
            y: 128
        });
        engine.addSprite(scoreSprite);
        var processOpts = {
            name: 'processWrap',
            resType: 'rect',
            width: timeProcessWidth,
            height: timeProcessHeight,
            fillStyle: 'rgba(0,0,0,.5)',
            strokeStyle: '#444',
            x : (originWidth - timeProcessWidth) / 2,
            y: 30
        };
        engine.addSprite(Engine.Sprite(processOpts));
        timeProcessSprite = Engine.Sprite($.extend({}, processOpts, {
            name: 'timeProcess',
            fillStyle: '#12A13F',
            lineWidth: 0,
        }));
        engine.addSprite(timeProcessSprite);
        secondTextSprite = Engine.Sprite({
            text: gameMilliseconds / 1000 + '\'s',
            x : originWidth / 2,
            y : 54,
            fillStyle: '#fff',
            font: 'normal normal 24px "Microsoft YaHei", "STHeiti Light", sans-serif'
        });
        engine.addSprite(secondTextSprite);
        for (var i = 0; i < 9; i++) {
            humanSprites[i] = Engine.Sprite({
                name: '',
                imgSrc: './image/renwu1.png',
                visible: false,
                x: childPoints[i * 2],
                y: childPoints[i * 2 + 1],
                index: i
            });
            // pre load at first
            humanSprites[i].loaded = true;
            humanSprites[i].on('mousedown,touchstart', touchListener);
            engine.addSprite(humanSprites[i]);
            lockSprites[i] = Engine.Sprite({
                name: 'lock',
                imgSrc: './image/lock.png',
                visible: false,
                x: lockPoints[i * 2],
                y: lockPoints[i * 2 + 1]
            });
            engine.addSprite(lockSprites[i]);
        }
        $('#loading').remove();
        engine.draw();
    });

    window.engine = engine;
    window.onresize = resize;
    resize();
}());