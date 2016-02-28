(function(){
    /* http request */
    var requestUrls = {
        GET_USER_STATUS: './json/user.json', /* 获取用户手机和剩余次数 {phone: '', restTimes: 2} */
        GET_RESULT: './json/result.json',    /* 获取结果 三种类型 {type: 1|2|3, content: ''} 1：红包 2：补贴 3：没有（没有抽奖机会时）， value: 红包金额 */
        ADD_TIME: '',      /* 分享成功，添加游戏次数 */
        PUSH_RESULT: ''    /* 领取红包上传 */
    } 
    // 获取用户信息
    var xhrUserStatus = $.ajax({
        url: requestUrls.GET_USER_STATUS,
        dataType: 'json'
    });
    /* event */
    $('#btnStart').bind('click', function(){
        $('#banner').remove();
        xhrUserStatus.then(function(json){
            // 接受用户状态数据
            phone = json.phone;
            playTimes = json.restTimes;
            initGame(json);
        });
    });
    var sending = false;
    $('#btnCode').bind('click', function(){
        if (sending) {
            return false;
        } else {
            sending = true;
            // TODO 获取短信验证码
            // 60秒计时
            setTimeout(function(){
                sending = false;
            }, 60000);     
        }
        
    });
    $('#btnClose').bind('click', function(params) {
        $('.popup').hide();
    });
    // 弹出手机绑定
    function popBindPhone(callback){
        $('#btnSubmit').off('click').bind('click', function(){
            var phone = $('#iptPhone').val(),
                code = $('#iptCode').val(); 
            if (phone && code) {
                // TODO 绑定手机号 
                
                callback && callback();
                $('.popup').hide();
            }
        });
         $('.popup').show(); 
    };
    var stage = new Engine(document.getElementById('stage'));
    var background = new Engine(document.getElementById('background'));
    var playTimes = 2; // 剩余游戏次数
    var phone = ''; // 预留手机号
    var time = 10000; // 10s
    // resource manager
    Engine.res = function(){
        var manifest = {},
            resources = {},
            length = 0;
        return {
            setConfig: function(config){
               manifest = $.extend({}, config);
               for (var i in manifest) {
                   length ++;
               }
            },
            load: function(callback){
                var c = 0, item, i, image,
                    loaded = function(){
                        this.complete = true;
                        c ++;
                        c >= length && callback();
                    };
                for (i in manifest) {
                    if (resources[i] && resources[i].complete) {
                        loaded();
                    } else {
                        item = manifest[i];
                        switch(item.type){
                            case 'image/png':
                            default: 
                                image = new Image;
                                image.src = item.path;
                                image.onload = image.onerror = loaded;
                                resources[i] = image; 
                        }   
                    }
                }
            },
            loadByName: function(name, callback){ 
               if (manifest[name]) {
                   if (resources[name] && resources[name].complete) {
                       callback(resources[name]);
                   } else {
                       var img = new Image;
                       img.src = manifest[name].path;
                       img.onload = function(){
                           resources[name] = img;
                           callback(img);
                       }
                   }
               } else {
                   callback(null);
               }
            },
            getRes: function(name){
                return resources[name];
            }
        };
    }();
    // init stage size
    (function(){
        var clientH = document.documentElement.clientHeight,
            clientW = document.documentElement.clientWidth,
            stageWidth = stage.getStageWidth(),
            stageHeight = stage.getStageHeight(),
            viewWidth = stageWidth,
            viewHeight = stageHeight,
            rate = 1;
        // show all
        if (viewWidth > clientW) {
            rate = viewWidth / clientW; 
            viewWidth = clientW;
            viewHeight = (viewHeight / rate) | 0;       
        }       
        if (viewHeight > clientH) {
            rate = viewHeight / clientH;
            viewHeight = clientH;
            viewWidth = (viewWidth / rate) | 0;
        }
        background.setViewportWidth(viewWidth).setViewportHeight(viewHeight);
        stage.setViewportWidth(viewWidth).setViewportHeight(viewHeight);
        stage.scaleX = stage.scaleY = viewWidth / stageWidth;
        $('canvas').css({
           top: (clientH - viewHeight) / 2,
           left: (clientW - viewWidth) / 2 
        });
    }());
    /** 所有资源图，统一域名下 **/  
    Engine.res.setConfig({
        'monkey_left': {
            path: './resource/assets/monkey_left.png'
        },
        'monkey_right': {
            path: './resource/assets/monkey_right.png'
        },
        'monkey_front': {
            path: './resource/assets/monkey_front.png'
        },
        'bg': {
            path: './resource/assets/bg.png'
        },
        'hongbao': {
            path: './resource/assets/hongbao.png'
        },
        'head': {
            path: './resource/assets/head.png'    
        },
        'button': {
            path: './resource/assets/btn_gift.png'
        },
        'miss_and_again': {
            path: './resource/assets/miss_and_again.png'
        },
        'miss_and_share': {
            path: './resource/assets/miss_and_share.png'
        },
        'receive_and_share': {
            path: './resource/assets/receive_and_share.png'
        },
        'receive_and_again': {
            path: './resource/assets/receive_and_again.png'
        },
        'receive_butie': {
            path: './resource/assets/receive_butie.png'
        },
        'receive_hongbao': {
            path: './resource/assets/receive_hongbao.png'
        }
    });
    function initGame(){
        /** 资源加载完毕 立即执行 **/
        Engine.res.load(function(){
            // background set nochange
            var backSprite = new Engine.Sprite();
            backSprite.setTexture(Engine.res.getRes('bg'));
            backSprite.x = 0;
            backSprite.y = 0;
            background.addSprite(backSprite);
            background.draw();
            /* game sence */
            // 顶部计时器
            var headSprite = new Engine.Sprite();
            headSprite.setTexture(Engine.res.getRes('head'));
            headSprite.point = {
                x: 17,
                y: 5
            };
            stage.addSprite(headSprite);
            /* 圆角进度条 渐变 */
            var processSprite = new Engine.Sprite();
            stage.addSprite(processSprite);
            /** 位置信息 hardcode **/
            processSprite.point = {x: 97, y: 148};
            processSprite.height = 28; 
            processSprite.width = 442;
            var gradient = stage.ctx.createLinearGradient(processSprite.point.x, processSprite.point.y, processSprite.point.x, processSprite.point.y + processSprite.height);
            gradient.addColorStop(0, '#99e374');
            gradient.addColorStop(0.25, '#daf390');
            gradient.addColorStop(1,  '#67ba2c');
            processSprite.opts.fillStyle = gradient;
            processSprite.draw = function(ctx){
                var r = this.height / 2,
                    x = this.point.x,
                    y = this.point.y;
                ctx.beginPath();        
                if (this.width > 0) {
                    ctx.moveTo(x + r, y);
                } else {
                    ctx.moveTo(x - r, y);
                }
                ctx.arcTo(x + this.width, y, x + this.width, y + this.height, r);
                ctx.arcTo(x + this.width, y + this.height, x, y + this.height, r);
                ctx.arcTo(x, y + this.height, x, y, r);
                if (this.width > 0) {
                    ctx.arcTo(x, y, x + r, y, r);
                } else {
                    ctx.arcTo(x, y, x - r, y, r)
                }
                ctx.fillStyle = processSprite.opts.fillStyle;
                ctx.fill();
            }
            // 进度条 10s
            function startTimerProcess() {
                var total = time,
                    width = processSprite.width = 442,
                    delta;
                (function processing(){
                    processSprite.width = Math.max(0, (1 - ((delta = (Date.now() - stage.startTime)) / total))) * width | 0;
                    delta < total && Engine.requestAnimationFrame(processing);
                }());  
            }
            // 我的礼包按钮
            var buttonSprite = new Engine.Sprite();
            buttonSprite.setTexture(Engine.res.getRes('button'));
            buttonSprite.point = {
                x: 446,
                y: 268
            };
            // 点击我的礼包
            buttonSprite.on('touchstart', function(){
            location.href = '#newpage'; 
            });
            stage.addSprite(buttonSprite);
            /** 底部猴子 **/
            var monkeySprite = new Engine.Sprite(),
                MONKEY_STATUS = {
                    FRONT: 'front',
                    LEFT: 'left',
                    RIGHT: 'right'
                };
            // 事件bind在顶层容器
            var position = {}, canvasOffset = $(stage.canvas).offset();
            $(stage.canvas).bind('touchstart', function(e){
                e = e.originalEvent || e;
                var touch = e.changedTouches[0];
                position = {
                    x: monkeySprite.point.x,
                    clientX: touch.clientX,
                    lastClientX: touch.clientX
                };
                return false;
            }).bind('touchmove', function(e){
                e = e.originalEvent || e;
                var touch = e.changedTouches[0];
                if (touch.clientX > position.lastClientX) {
                    toggleStatus(MONKEY_STATUS.RIGHT);
                } else {
                    toggleStatus(MONKEY_STATUS.LEFT);
                }
                position.lastClientX = touch.clientX;
                // 设定x
                var x = position.x + (position.lastClientX - position.clientX) * (1 / stage.scaleX); // 画布被缩放，反缩放
                monkeySprite.point.x = x < 0 ? 0 : monkeySprite.width + x > stage.getStageWidth() ? stage.getStageWidth() - monkeySprite.width : x;
                return false;
            }).bind('touchend', function(e){
                toggleStatus();
                return false;
            });    
            toggleStatus();
            monkeySprite.point.x = 225;
            stage.addSprite(monkeySprite);
            // 更换猴子的状态, 高度不一致
            function toggleStatus(status){
                monkeySprite.sheetStatus = status; 
                switch(status){
                    case MONKEY_STATUS.LEFT:
                        monkeySprite.setTexture(Engine.res.getRes('monkey_left'));
                        monkeySprite.point.y = 911;
                        break;
                    case MONKEY_STATUS.RIGHT:
                        monkeySprite.setTexture(Engine.res.getRes('monkey_right'));
                        monkeySprite.point.y = 933;
                        break;
                    case MONKEY_STATUS.FRONT:
                    default:
                        monkeySprite.setTexture(Engine.res.getRes('monkey_front'));
                        monkeySprite.point.y = 869;
                }
            };
            /** 添加红包 **/
            var speed = 10; // 掉落速度
            var frameRate = 30; //红包位置更新帧率(<60)
            var hongbaoTimer = 0;
            function addHongbao(){
                stage.addSprite(createHongbaoSprite());
                hongbaoTimer = stage.running ? setTimeout(addHongbao, 500): clearTimeout(hongbaoTimer);
            }
            function createHongbaoSprite(){
                var sprite = new Engine.Sprite({name: 'hongbao'});
                sprite.setTexture(Engine.res.getRes('hongbao'));
                // 随机角度 20以内
                sprite.rotate = ((Math.random() * 20) | 0) * (Date.now() % 2 == 0 ? 1 : -1);
                // x,y
                sprite.point.y = -sprite.height;
                sprite.point.x = (Math.random() * (stage.getStageWidth() - sprite.width)) | 0;
                sprite.on('addToStage', function(){
                    drop(sprite);
                });
                return sprite;
            }
            function drop(sprite){
                var by = sprite.point.y,
                    ey = sprite.point.y + sprite.height,
                    x = sprite.point.x + (sprite.width / 2 + 0.5) | 0;
                // exploded
                if (sprite.explode) {
                    sprite.point.y -= speed / 2;
                } else {
                    sprite.point.y += speed; 
                    // out of stage
                    if (by > stage.getStageHeight()) {
                        stage.removeSprite(sprite);
                    } else if (ey > monkeySprite.point.y + monkeySprite.height / 4) { // 在猴子所在Y轴区间，下落到猴子1/4处
                        var hit = false; 
                        switch(monkeySprite.sheetStatus){
                            case MONKEY_STATUS.LEFT:
                            hit = x > monkeySprite.point.x && x < monkeySprite.point.x + 80; // 80= 往左时盘子的宽
                            break;
                            case MONKEY_STATUS.RIGHT:
                            hit = x > 100 + monkeySprite.point.x && x < monkeySprite.point.x + monkeySprite.width;// 100 往右时猴子的身体宽
                            break;
                            case MONKEY_STATUS.FRONT:
                            default:
                                hit = x > 40 + monkeySprite.point.x && x < monkeySprite.point.x + monkeySprite.width;
                            break;
                        }
                        if (hit) {
                            console.log('hit');
                            score ++;
                            // +1 
                            sprite.setTexture('+1');
                            sprite.opts.font = '24px Courier New, Courier, monospace';
                            sprite.opts.fillStyle = '#a00';
                            sprite.explode = true;
                            sprite.rotate = 0;
                            setTimeout(function() {
                                sprite.visible = false;
                                stage.removeSprite(sprite);
                            }, 500);
                        }
                    }
                }
                stage.running && sprite.visible && setTimeout(function(){
                    drop(sprite);
                }, 1000 / frameRate);
            }
            function rotate(sprite){
                sprite.rotate += 1;
                stage.running && Engine.requestAnimationFrame(function(){
                    rotate(sprite);
                })
            }
            /** 游戏开始 **/
            var score = 0;
            var result = {};
            function start(){
                playTimes--;
                playTimes = Math.max(0, playTimes); // 确保非负数
                var millseconds = time; // 10s
                score = 0;
                stage.start();
                addHongbao();
                startTimerProcess();
                // check timeup
                (function timeup(){
                    Engine.requestAnimationFrame(function(){
                        if (Date.now() - stage.startTime > millseconds) {
                            stage.end();
                        } else {
                            timeup();
                        }
                    });
                }())
            }
            /* 监听游戏开始结束 */
            stage.on('start', function(){
                console.log('start');
            });
            stage.on('end', function(){
                // 清空红包
                var sprites = stage.getSprites();
                for (var i = sprites.length - 1; i > 0; i -= 1) {
                    if (sprites[i].name == 'hongbao') {
                        stage.removeSprite(sprites[i]);
                    }
                }
                stage.draw();
                // TODO 获取结果
                $.ajax({
                    url: requestUrls.GET_RESULT,
                    data: JSON.stringify({score: score}),
                    dataType: 'json'
                }).then(function(json){
                    result = json;
                    popup(json.type, json.value);   
                });
            });
            // 执行游戏
            start();
            /* 弹窗逻辑 3类型 */
            function popup(prizeType, value){ /* 得奖类型 */   
                switch (prizeType) {
                    case 1: 
                        /* 红包 50 */
                        popHongbao(value); 
                        break;
                    case 2:
                        popButie();
                        break;
                    case 3: 
                    default:
                        popMiss(playTimes);
                        break;
                }
            }
            var popupPoint = {x: 25, y: 418}; /* 弹窗位置 */
            /* 弹窗 */
            function popHongbao(money){
                var sprite = new Engine.Sprite();
                sprite.setTexture(Engine.res.getRes('receive_hongbao'));
                sprite.point = popupPoint;
                // 金额
                var moneyText = new Engine.Sprite();
                money = '' + money;    
                moneyText.setTexture(money);
                // 字体 大小
                moneyText.opts.font = '28px Courier New, Courier, monospace';
                moneyText.opts.fillStyle = '#000';
                moneyText.opts.strokeStyle = '#4e9231';
                moneyText.opts.strokeWidth = 2;
                moneyText.point = {x: 282 + (money.length == 3 ? 0 : 7), y: 110};
                sprite.addChild(moneyText);
                stage.addSprite(sprite);
                var btn = popupButtonSprite();
                stage.addSprite(btn);
                // 领取红包
                btn.on('touchstart', function(){
                    if (phone) {
                        /* 点击领取红包，获取手机号， popHongbaoAgain() */
                        popHongbaoHasPhone(playTimes);
                    } else {
                        popBindPhone(function(){
                            popHongbaoHasPhone(playTimes);    
                        });
                    }
                    stage.removeSprite(btn);
                    stage.removeSprite(sprite);
                    stage.draw();
                });
                /* 更新之后绘制 */ 
                stage.draw();
            }
            function popHongbaoHasPhone(times){
                var sprite = new Engine.Sprite();
                sprite.setTexture(Engine.res.getRes(times > 0 ? 'receive_and_again' : 'receive_and_share'));
                sprite.point = popupPoint;
                stage.addSprite(sprite);
                var btn = popupButtonSprite();
                stage.addSprite(btn);
                btn.on('touchstart', function(){
                stage.removeSprite(btn);
                stage.removeSprite(sprite); 
                stage.draw();
                // TODO
                times > 0 ? start(): alert('分享');
                });
                stage.draw();
            }
            function popButie(){
                var sprite = new Engine.Sprite();
                sprite.setTexture(Engine.res.getRes('receive_butie'));
                sprite.point = popupPoint;
                stage.addSprite(sprite);
                var btn = popupButtonSprite(function(){
                    /* 领取补贴 */
                    console.log('领取补贴');
                    if (phone) {
                        popButieHasPhone(playTimes);
                        pushResult();
                    } else {
                        // 填写电话号码
                        popBindPhone(function(){
                            popButieHasPhone(playTimes);    
                        });
                    }
                    stage.removeSprite(sprite);
                    stage.removeSprite(btn);
                    stage.draw();
                });
                stage.addSprite(btn);
                stage.draw()
            }
            function popButieHasPhone(times){
                // 使用相同弹窗
                popHongbaoHasPhone(times);
            }
            function popMiss(times){
                var sprite = new Engine.Sprite();
                sprite.setTexture(Engine.res.getRes(times > 0 ? 'miss_and_again' : 'miss_and_share'));
                sprite.point = popupPoint;
                var btn = popupButtonSprite(function(){
                stage.removeSprite(sprite);
                stage.removeSprite(btn);
                stage.draw();
                // TODO
                times > 0 ? start() : alert('分享');
                });
                stage.addSprite(sprite);
                stage.addSprite(btn);
                stage.draw();
            }
            function popupButtonSprite(touchCallback){
                var sprite = new Engine.Sprite();
                sprite.draw = function(ctx){
                    ctx.fillStyle = 'transparent';
                    ctx.globalAlpha = 0;
                    ctx.lineWidth = 0;
                    ctx.fillRect(sprite.point.x, sprite.point.y, sprite.width, sprite.height);
                };
                // 固定位置的button
                sprite.point = {x: 212, y: 568};
                sprite.width = 218;
                sprite.height = 86;
                sprite.on('touchstart', touchCallback || function(){});
                return sprite;
            }
            // 领取结果
            function pushResult(prize){
                prize = prize || result;
                return $.ajax({
                    url: requestUrls.PUSH_RESULT,
                    data: JSON.stringify(prize)
                });
            }
            /** 移除loadingview **/
            $('#loadingView').remove();
        });
    }
    // preload 异步加载图片
    Engine.res.load(function(){});
    /** TODO 微信分享sdk 分享成功 location.reload() **/
}());