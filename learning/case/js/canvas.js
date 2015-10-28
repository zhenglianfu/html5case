/**
 * Created by Administrator on 2015/4/20.
 */
PManager.load('zepto,engine', function(data, error){
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
        clear(context);
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
        clear(context);
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

    // filter canvas
    (function(){
        var canvas = $('#filter-canvas')[0],
            engine = new Engine(canvas),
            context = canvas.getContext('2d'),
            imgTypes = ['png', 'jpg', 'jpeg', 'bmp', 'gif'],
            imgRange = {},
            originImg = null,
            restoreImgData = null;
        function drawImg(img){
            var x = canvas.width,
                y = canvas.height,
                w = img.width,
                h = img.height,
                sx = 0,
                sy = 0,
                rate = 1;
            originImg = img;
            if (w > x) {
                rate = x / w;
                w = x;
                h = h * rate;
            }
            if (h > y) {
                rate = y / h;
                w = w * rate;
                h = y;
            }
            sx = (x - w) / 2;
            sy = (y - h) / 2;
            engine.clearAll();
            context.drawImage(img, sx, sy, w, h);
            // Security error: cross domain resource
            try {
                restoreImgData = context.getImageData(sx, sy, w, h);
            } catch(e){
            }
            return imgRange = {
                x : sx,
                y : sy,
                w : w,
                h : h
            };
        }
        $('#filter-file').bind('change', function(){
            if (this.value) {
                var tokens = this.value.toLowerCase().split('.');
                var img  = new Image(),
                    file = this.files[0];
                img.onload = function(){
                    imgRange = drawImg(img);
                };
                if (imgTypes.indexOf(tokens[tokens.length - 1]) >= 0) {
                    if (window.URL && window.URL.createObjectURL) {
                        img.src = URL.createObjectURL(file);
                    } else if (window.FileReader) {
                        var read = new FileReader;
                        read.onload = function(e){
                            img.src = read.result;
                            imgRange = drawImg(img);
                        }
                        read.readAsDataURL(file);
                    } else {
                        // IE or old browser
                        alert('您的浏览器out了，不支持即时预览, 下载最新版的IE浏览器吧');
                    }
                } else{
                    alert('请选择' + imgTypes.join(',')+'格式的图片');
                }
            }
        });
        // img rgb opera
        function takeBack(imgData){
            var data = imgData.data,
                i = 0, len = data.length;
            for (; i < len; i+=4) {
                data[i] = 255 - data[i];
                data[i + 1] = 255 - data[i + 1];
                data[i + 2] = 255 - data[i + 2];
            }
            return imgData;
        }
        function sepia(imgData) {
            var data = imgData.data,
                i = 0, len = data.length;
            for (; i < len; i += 4) {
                var r = data[i],
                    g = data[i + 1],
                    b = data[i + 2];
                data[i] = (r * 0.393) + (g * 0.769) + (b * 0.189); // red
                data[i + 1] = (r * 0.349) + (g * 0.686) + (b * 0.168); // green
                data[i + 2] = (r * 0.272) + (g * 0.534) + (b * 0.131); // blue
            }
            return imgData;
        }
        function grayScale(imgData){
            var data = imgData.data,
                i = 0, len = data.length;
            for (; i < len; i+=4) {
                data[i] = data[i+1] = data[i+2] = (data[i] + data[i+1] + data[i+2]) / 3;
            }
            return imgData;
        }
        function grayScale2(imgData){
            var data = imgData.data,
                i = 0, len = data.length;
            for (; i < len; i+=4) {
                data[i] = data[i+1] = data[i+2] = .299 * data[i] + .587 * data[i+1] + .114 * data[i+2];
            }
            return imgData;
        }

        function grayScale3(imgData){
            var data = imgData.data,
                i = 0, len = data.length;
            for (; i < len; i+=4) {
                var r = data[i],
                    g = data[i + 1],
                    b = data[i + 2];
                data[i] = Math.abs(g - r + g + b) * r / 256;
                data[i + 1] = Math.abs(b - r + g + b) * r / 256;
                data[i + 2] = Math.abs(b - r + g + b) * g / 256;
                data[i] = data[i+1] = data[i+2] = (data[i] + data[i+1] + data[i+2]) / 3;
            }
            return imgData;
        }

        function brightness(imgData, delta){
            var data = imgData.data,
                i = 0, len = data.length;
            for (; i < len; i+=4) {
                data[i] += delta;
                data[i + 1] += delta;
                data[i + 2] += delta;
            }
            return imgData;
        }
        function redMask(imgData){
            var data = imgData.data,
                i = 0, len = data.length;
            for (; i < len; i+=4) {
                data[i] = (data[i] + data[i+1] + data[i+2]) / 3;
                data[i+1] = data[i+2] = 0;
            }
            return imgData;
        }
        function greenMask(imgData){
            var data = imgData.data,
                i = 0, len = data.length;
            for (; i < len; i+=4) {
                data[i + 1] = (data[i] + data[i+1] + data[i+2]) / 3;
                data[i] = data[i+2] = 0;
            }
            return imgData;
        }
        function blueMask(imgData){
            var data = imgData.data,
                i = 0, len = data.length;
            for (; i < len; i+=4) {
                data[i + 2] = (data[i] + data[i+1] + data[i+2]) / 3;
                data[i] = data[i+1] = 0;
            }
            return imgData;
        }
        function blackWhite(imgData){
            var data = imgData.data,
                i = 0, len = data.length;
            for (; i < len; i+=4) {
                var average = (data[i] + data[i+1] + data[i+2]) / 3;
                data[i] = data[i+1] = data[i+2] = average > 150 ? 255 : 0;
            }
            return imgData;
        }
        function freeze(imgData){
            var data = imgData.data,
                i = 0, len = data.length;
            for (; i < len; i+=4) {
                var r = data[i],
                    g = data[i+1],
                    b = data[i+2];
                data[i] = (r - g -b) * 3 / 2;
                data[i + 1] = (g - r -b) * 3 / 2;
                data[i + 1] = (b - r - g) * 3 / 2;

            }
            return imgData;
        }
        function fudiao(imgData){
            var data = imgData.data,
                i = 0, len = data.length;
            for (; i < len; i+=4) {
                var r = data[i],
                    g = data[i+1],
                    b = data[i+2],
                    nextR = data[i+4] || 128,
                    nextG = data[i+5] || 128,
                    nextB = data[i+6] || 128;
                r = nextR - r + 128;
                g = nextG - g + 128;
                b = nextB - b + 128;
                data[i] = data[i+1] = data[i+2] = (r + g + b) / 3;
            }
            return imgData;
        }

        function storeImg(){
            restoreImgData && context.putImageData(restoreImgData, imgRange.x, imgRange.y);
        }
        // events
        $('.filter-ctrl').on('click', 'a', function(){
            storeImg();
            var $a = $(this),
                imgData = context.getImageData(imgRange.x, imgRange.y, imgRange.w, imgRange.h);
            if ($a.hasClass('takeBack')) {
                imgData = takeBack(imgData);
            }else if ($a.hasClass('sepia')) {
                imgData = sepia(imgData);
            }else if ($a.hasClass('grayScale')) {
                imgData = grayScale(imgData)
            }else if ($a.hasClass('redMask')) {
                imgData = redMask(imgData);
            }else if ($a.hasClass('greenMask')) {
                imgData = greenMask(imgData);
            }else if ($a.hasClass('blueMask')) {
                imgData = blueMask(imgData);
            }else if ($a.hasClass('blackWhite')) {
                imgData = blackWhite(imgData);
            }else if($a.hasClass('grayScale2')){
                imgData = grayScale2(imgData);
            }else if($a.hasClass('freeze')){
                imgData = freeze(imgData);
            }else if($a.hasClass('fudiao')){
                imgData = fudiao(imgData);
            }else if($a.hasClass('grayScale3')){
                imgData = grayScale3(imgData);
            }
            context.putImageData(imgData, imgRange.x, imgRange.y);
        });
        $('#brightnessRange').change(function(){
            context.putImageData(brightness(context.getImageData(imgRange.x, imgRange.y, imgRange.w, imgRange.h), +($('#brightnessRange').val() - 50 || 0)), imgRange.x, imgRange.y);
        });
        $('#urlSubmit').click(function(){
            var url = $('#filter-file-url').val();
            if (url) {
                var img = new Image();
                img.onload = function(){
                    imgRange = drawImg(img);
                }
                img.src = url;
            }
        });
        $('#originSize').click(function(){
            if (originImg) {
                canvas.width = originImg.width;
                canvas.height = originImg.height;
                drawImg(originImg);
            }
        });
        $('#canvasSize').click(function(){
            canvas.width = 400;
            canvas.height = 300;
            drawImg(originImg);
        });
        (function(){
            var img = new Image();
            img.onload = function(){
                drawImg(img);
            }
            img.src = location.origin + '/images/sample.jpg';
        }())
    }());

    // clip canvas
    (function(){
        var canvas = document.getElementById('imgClip-canvas'),
            engine = Engine(canvas),
            fileInput  = document.getElementById('clipFileInput'),
            clipBtn    = document.getElementById('clipBtn'),
            clipHelper = document.getElementById('clipHelper');
        // set area
        canvas.width = 300;
        canvas.height = 300;
        // bind event
        clipBtn.addEventListener('click', function(){
            var top = clipHelper.offsetTop + 1,
                left = clipHelper.offsetLeft + 1,
                w = clipHelper.clientWidth,
                h = clipHelper.clientHeight,
                imageData = engine.getImageData(left, top, w, h);
            engine.clearAll().putImageData(imageData, left, top);
        });
        fileInput.addEventListener('change', function(){
            var file;
            if (this.value) {
                file = this.files[0];
                readFileAsURL(file, function(src){
                    var img = new Image;
                    img.src = src;
                    img.onload = function(){
                        // TODO 图片适应大小canvas
                        var imgWidth  = img.width,
                            imgHeight = img.height,
                            cx = 0,
                            cy = 0,
                            rate;
                        if (imgWidth > canvas.width) {
                            rate = canvas.width / imgWidth;
                            imgWidth  = img.width = canvas.width;
                            imgHeight = img.height = imgHeight * rate;
                        }
                        if (img.height > canvas.height) {
                            rate = canvas.height / imgHeight;
                            imgHeight = img.height = canvas.height;
                            imgWidth  = img.height = imgHeight * rate;
                        }
                        cx = (canvas.width - imgWidth) / 2;
                        cy = (canvas.height - imgHeight) / 2;
                        engine.clearAll();
                        engine.ctx.drawImage(img, cx, cy, imgWidth, imgHeight);
                    }
                });
            }
        });
        // move event
        // TODO save as a common component -> drag-component
        function Drag(el, opts){

        }
        var mouseDown = false,
            originX = 0,
            originY = 0,
            originPositionX = 0,
            originPositionY = 0,
            top = 0,
            left = 0,
            width   = clipHelper.offsetWidth,
            height  = clipHelper.offsetHeight,
            containerHeight = 300,
            containerWidth  = 300;
        clipHelper.addEventListener('mousedown', function(e){
            originX = e.clientX + pageXOffset;
            originY = e.clientY + pageYOffset;
            originPositionY = clipHelper.offsetTop;
            originPositionX = clipHelper.offsetLeft;
            width  = clipHelper.offsetWidth;
            height = clipHelper.offsetHeight;
            mouseDown = true;
        });
        clipHelper.addEventListener('mousemove', function(e){
            // 不仅可以移动，可以缩放，向内缩小时不能阻止移动事件冒泡到父级
            //e.stopPropagation();
            e.preventDefault();
            if (mouseDown) {
                var deltaX = e.clientX + pageXOffset - originX,
                    deltaY = e.clientY + pageYOffset - originY;
                top = originPositionY + deltaY;
                left = originPositionX + deltaX;
                if (top < 0) {
                    top = 0
                } else if (containerHeight < top + height) {
                    top = containerHeight - height;
                }
                if (left < 0) {
                    left = 0;
                } else if (containerWidth < left + width) {
                    left = containerWidth - width;
                }
                $(clipHelper).css({
                    left: left,
                    top : top
                });
            }
        });
        clipHelper.addEventListener('mouseup', function(){
            mouseDown = false;
        });
        var blocks = document.querySelectorAll('.block');
        for (var i = 0, len = blocks.length; i < len; i++) {
            blocks[i].addEventListener('mousedown', cliperResize);
            blocks[i].addEventListener('mouseup', cliperResize);
        }
        // 位移 委托在剪裁区域中
        clipHelper.parentNode.addEventListener('mousemove', cliperResize);
        document.body.addEventListener('mouseup', cliperResize);
        var resizeMouseDown = false;
        var width  = 0;
        var height = 0;
        var className = '';
        // 被父类元素capture住了mousemove事件, 没有dispatch到子元素
        function cliperResize(e){
            var ele = this;
            e.preventDefault();
            e.stopPropagation();
            if (e.type == 'mousedown'){
                originPositionX = e.clientX + pageXOffset;
                originPositionY = e.clientY + pageYOffset;
                width  = $('#clipHelper').offset().width;
                height = $('#clipHelper').offset().height;
                top    = parseInt($('#clipHelper').css('top'));
                left   = parseInt($('#clipHelper').css('left'));
                resizeMouseDown = true;
                className = ' ' + e.target.className + ' ';
            } else if (e.type == 'mousemove') {
                if (resizeMouseDown) {
                    var deltaX = e.clientX + pageXOffset - originPositionX,
                        deltaY = e.clientY + pageYOffset - originPositionY;
                    if (className.indexOf(' north ') > -1) {
                        $('#clipHelper').height(height - deltaY).css('top', top + deltaY);
                    } else if (className.indexOf(' south ') > -1) {
                        $('#clipHelper').height(height + deltaY);
                    } else if (className.indexOf(' west ') > -1) {
                        $('#clipHelper').width(width - deltaX).css('left', left + deltaX);
                    } else if (className.indexOf(' east ') > -1) {
                        $('#clipHelper').width(width + deltaX);
                    } else if (className.indexOf(' north-east ') > -1) {
                        $('#clipHelper').height(height - deltaY).css('top', top + deltaY).width(width + deltaX);
                    } else if (className.indexOf(' north-west ') > -1) {
                        $('#clipHelper').height(height - deltaY).css('top', top + deltaY).width(width - deltaX).css('left', left + deltaX);
                    } else if (className.indexOf(' south-east ') > -1) {
                        $('#clipHelper').height(height + deltaY).width(width + deltaX);
                    } else if (className.indexOf(' south-west ') > -1) {
                        $('#clipHelper').height(height + deltaY).width(width - deltaX).css('left', left + deltaX);
                    }
                    console.log(className);
                }
            } else if (e.type == 'mouseup') {
                resizeMouseDown = false;
            }
        }
    }());

    /** canvas play video */
    (function(){
        var videoSrc = './videos/mov_bbb.mp4';
        var v = document.createElement('VIDEO');
        var videoCanvas = document.getElementById('video-canvas');
        var ctx = videoCanvas.getContext('2d');
        var drawTimer = 0;
        var play = false;
        v.src = videoSrc;
        v.load();
        videoCanvas.width = 270;
        videoCanvas.height = 135;
        v.addEventListener('play', function(){
            drawTimer = setInterval(function(){
                ctx.drawImage(v, 0, 0, 270, 135);
            }, 17);
        });
        v.addEventListener('pause', function(){
            clearInterval(drawTimer);
        });
        v.addEventListener('ended', function(){
            clearInterval(drawTimer);
        });
        videoCanvas.addEventListener('click', function(){
            if (play) {
                v.pause();
            } else {
                v.play();
            }
            play = !play;
        });
    }());

    // common functions
    function readFileAsURL(file, fun){
        if (window.URL && URL.createObjectURL) {
            fun && fun(URL.createObjectURL(file));
        } else if (window.FileReader) {
            var reader = new FileReader;
            reader.onload = function(){
                fun && fun(reader.result);
            }
            reader.readAsDataURL(file);
        } else {
            alert('your browser is too old!');
        }
    }
});
