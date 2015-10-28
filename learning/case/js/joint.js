/**
 * Created by Administrator on 2015/10/22.
 */
(function(){
    var $wrap = $('#canvasWrap'),
        $canvas = $('#canvas'),
        canvas = $canvas[0],
        width = $wrap.width(),
        context2D = canvas.getContext('2d'),
        $canvasBuffer = $('#canvasBuffer'),
        canvasBuffer = $canvasBuffer[0],
        context2DBuffer = canvasBuffer.getContext('2d');
    canvasBuffer.width  = canvas.width  = width;
    canvasBuffer.height = canvas.height = width * 1.33;
    // functions and position info
    var imgPositions = [];
    var templatePosition = {};
    var drawTemplate = function drawTemplate(src, params){
        var img = new Image;
        var drawTemplateHelper = function(){
            var h = img.height,
                w = img.width,
                canvas_h = canvas.height,
                canvas_w = canvas.width,
                swidth = w,
                sheight = h;
            if (h > w && h > canvas_h) {
                swidth = (canvas_h / h) * w;
                sheight = canvas_h;
            } else if (w > h && w > canvas_w) {
                sheight = (canvas_w / w) * h;
                swidth = canvas_w;
            }
            // store position info
            templatePosition = {
                nw : w,
                nh: h,
                x : (canvas_w - swidth) / 2,
                y : (canvas_h - sheight) / 2,
                w : swidth,
                h : sheight,
                img : img,
                scaleX: swidth / w,
                scaleY: sheight / h
            };
            // clear at first
            context2D.clearRect(0,0,canvas.width,canvas.height);
            $wrap.find('.mask').remove();
            // 定位图片位置
            positionImg(templatePosition, JSON.parse(params));
            // 绘制模板
            context2D.drawImage(img, templatePosition.x, templatePosition.y, swidth, sheight);
        };
        img.src = src;
        img.onload = drawTemplateHelper;
    };
    var positionImg = function(templatePosition, params){
        var scaleX = templatePosition.scaleX,
            scaleY = templatePosition.scaleY;
        imgPositions = [];
        for (var i = 0, len = params.length; i < len; i+=1) {
            var item = params[i];
            imgPositions[i] = {
                x : templatePosition.x + item.x * scaleX,
                y: templatePosition.y + item.y * scaleY,
                w: item.w * scaleX,
                h: item.h * scaleY,
                index: i,
                scale: 1,
                rotate: 0
            };
            imgPositions[i].custImg = new CustomImg(imgPositions[i]);
            $wrap.append($('<div>').addClass('mask').attr('data-index', i).css({
                left: imgPositions[i].x,
                top: imgPositions[i].y,
                width: imgPositions[i].w,
                height: imgPositions[i].h,
                position: 'absolute'
            }));
        }
    };
    var redraw = function redraw(){
        //context2D.clearRect(0,0,canvas.width,canvas.height);
        for (var i = 0, len = imgPositions.length; i < len; i++) {
            var cus = imgPositions[i],
                scale = cus.scale,
                x = (cus.img_x + (1 - scale) / 2 * cus.img_w + 0.5) >> 0,
                y = (cus.img_y + (1 - scale) / 2 * cus.img_h + 0.5) >> 0,
                w = (cus.img_w * scale + 0.5) >> 0,
                h = (cus.img_h * scale + 0.5) >> 0;  // 所有位置取整数
            // 清空当前绘制区域
            context2DBuffer.clearRect(cus.x, cus.y, cus.w, cus.h);
            // 在自己的区域内放置图片  利用第二个canvas getImageData then putImageData
            context2DBuffer.save();
            context2DBuffer.translate(x + w / 2, y + h / 2);
            context2DBuffer.rotate(cus.rotate);
            context2DBuffer.drawImage(cus.custImg.img, -(w / 2), -(h / 2), cus.img_w * scale, cus.img_h * scale);
            context2DBuffer.restore();
            context2D.putImageData(context2DBuffer.getImageData(cus.x, cus.y, cus.w, cus.h), cus.x, cus.y);
            //context2D.save();
            //context2D.translate(x + w / 2, y + h / 2);
            //context2D.rotate(cus.rotate);
            //context2D.drawImage(cus.custImg.img, -(w / 2), -(h / 2), cus.img_w * scale, cus.img_h * scale);
            //context2D.restore();
        }
        //context2D.drawImage(templatePosition.img, templatePosition.x, templatePosition.y, templatePosition.w, templatePosition.h);
        context2DBuffer.clearRect(0,0,canvasBuffer.width, canvasBuffer.height);
    };
    // customer image Object with position
    var CustomImg = function CustomImg(opts){
        if (!(this instanceof CustomImg)) {
            return new CustomImg(opts);
        }
        var configs = opts || {};
        this.setImg(configs.img);
        this.get = function(key){
            return configs[key];
        };
        this.set = function(key, value){
            if (typeof key === 'object') {
                for (var i in key) {
                    configs[i] = key[i];
                    i === 'img' && this.setImg(key[i]);
                }
            } else {
                configs[key] = value;
                key === 'img' && this.setImg(value);
            }
        };
    };
    CustomImg.prototype = {
        read : false,
        setImg : function(img){
            this.img = new Image;
            if(img == null) {
                return;
            } else if (typeof img === 'string') {
                this.img.src = img;
            } else if ((window.File && img instanceof File)){
                if (window.URL && URL.createObjectURL) {
                    this.img.src = URL.createObjectURL(img);
                } else if (window.FileReader) {
                    var fr = new FileReader,
                        that = this;
                    this.read = true;
                    fr.onload = function(){
                        that.img.src = fr.result;
                        that.read = false;
                    };
                    fr.readAsDataURL(img);
                } else {
                    throw {message: 'can\'t read file in your browser'};
                }
            } else if (img.nodeType === 1 && img.tagName === 'IMG') {
                this.img = img;
            } else {
                console.log('unknow type');
            }
        },
        isLoaded: function(){
            return !this.read && this.img.src && this.img.complete;
        },
        when: function(fn){
            if (this.isLoaded()) {
                fn && fn();
            } else {
                var pointer = this;
                setTimeout(function(){
                    pointer.when(fn);
                }, 100);
            }
        }
    };
    // click on templates
    $('.template').bind('click', function(){
        if ($(this).hasClass('active')) {
            return false;
        } else {
            $('.template').removeClass('active');
            $(this).addClass('active');
        }
        drawTemplate($(this).attr('data-src'), $(this).attr('data-params'));
    });
    // upload file
    var selectIndex = 0,
        clientEvents = /mobile/i.test(navigator.userAgent) ? ['touchstart', 'touchmove', 'touchend'] : ['mousedown', 'mousemove', 'mouseup'],
        focuson = false,
        move = false,
        movestart = {},
        originalPosition = {},
        scale = false,
        inrange = false,
        checkClientPosition = function(e){
            var rectClientX = e.clientX + (window.pageXOffset || document.body.scrollLeft) - $wrap.offset().left,
                rectClientY = e.clientY + (window.pageYOffset || document.body.scrollTop) - $wrap.offset().top;
            for (var i = 0, len = imgPositions.length; i < len; i++) {
                var p = imgPositions[i];
                if (rectClientX > p.x && rectClientX < p.x + p.w && rectClientY > p.y && rectClientY < p.y + p.h) {
                    return p;
                }
            }
            return false;
        },
        checkFingers = function(e){
            var touches = e.touches,
                results = [];
            for (var i = 0, len = touches.length; i < len; i++) {
                results[i] = checkClientPosition(touches[i]);
            }
            var index = results[0].index;
            for (i = 0; i < len; i++) {
                if (results[i] && results[i].index == index) {
                    continue;
                } else {
                    return false;
                }
            }
            return results[0];
        },
        handleClick = function(e){
            var custImg = null;
            if ((custImg = checkClientPosition(e))) {
                selectIndex = custImg.index;
                $('#fileInput').trigger('click');
            }
        },
        moveHandler = function(e, originEvent){
            var custImg = currentImg;
            if (focuson && custImg) {
                // distance / rotate
                custImg.img_x = originalPosition.x + (e.clientX - movestart.x);
                custImg.img_y = originalPosition.y + (e.clientY - movestart.y);
                redraw();
                originEvent.stopPropagation();
                originEvent.preventDefault();
                return false;
            }
        },
        // mobile only
        scaleStart = {},
        scaleEnd = {},
        initialDistance = 0,
        initialScale = 1,
        initialRotate = 0,
        custRotate = 0,
        moveTimer = null,
        currentImg = null,
        scaleHandler = function(e, originEvent){
            var custImg = checkFingers(originEvent) || currentImg;
            if (custImg) {
                var points = calculateScalePoints(originEvent),
                    distance = Math.sqrt(Math.pow((points.scaleStart.rectX - points.scaleEnd.rectX), 2) + Math.pow((points.scaleStart.rectY - points.scaleEnd.rectY), 2));
                // 只旋转，只缩放，判断权重比例，一方过小则忽略
                var scale = initialScale * distance / initialDistance,
                    deltaScale = Math.abs(custImg.scale - scale),
                    rotate = custRotate + Math.atan2(points.scaleStart.rectY - points.scaleEnd.rectY, points.scaleStart.rectX - points.scaleEnd.rectX) - initialRotate,
                    deltaRotate = Math.abs(rotate - custImg.rotate);
                if (deltaRotate + deltaScale != 0) {
                    if (deltaRotate / (deltaRotate + deltaScale) > 0.65) {
                        custImg.rotate = rotate;
                    } else if (deltaScale / (deltaRotate + deltaScale) > 0.65) {
                        custImg.scale = scale;
                    }
                } else {
                    custImg.scale = scale;
                    custImg.rotate = rotate;
                }
                redraw();
                originEvent.stopPropagation();
                originEvent.preventDefault();
                return false;
            }
        },
        calculateScalePoints = function(e){
            var touches = e.touches,
                offset = $wrap.offset(),
                points = {};
            for (var i = 0; i < 2; i+=1) {
                points[i == 0? 'scaleStart' : 'scaleEnd'] = {
                    screenX : touches[i].clientX + (window.pageXOffset || document.body.scrollLeft),
                    screenY : touches[i].clientY + (window.pageYOffset || document.body.scrollTop),
                    rectX : touches[i].clientX + (window.pageXOffset || document.body.scrollLeft) - offset.left,
                    rectY : touches[i].clientY + (window.pageYOffset || document.body.scrollTop) - offset.top
                };
            }
            return points;
        },
        initScaleState = function(e){
            var points = calculateScalePoints(e);
            scaleStart = points.scaleStart;
            scaleEnd = points.scaleEnd;
            initialDistance = Math.sqrt(Math.pow((scaleStart.rectX - scaleEnd.rectX), 2) + Math.pow((scaleStart.rectY - scaleEnd.rectY), 2));
            initialRotate = Math.atan2((scaleStart.rectY - scaleEnd.rectY), (scaleStart.rectX - scaleEnd.rectX));
            var temp = checkClientPosition(e.changedTouches[0]);
            if (temp != false) {
                initialScale = temp.scale;
                custRotate = temp.rotate;
            } else {
                initialScale = 1;
                custRotate = 0;
            }
        },
        clearScale = function(){
            for (var i = 0, len = imgPositions.length; i < len; i += 1) {
                imgPositions[i].scale = 1;
            }
        };
    $wrap.bind(clientEvents[0], function(e){
        focuson = true;
        move = false;
        var originEvent = e.originalEvent;
        var custImg = null;
        if (e.type == 'touchstart') {
            e = originEvent.changedTouches[0];
        }
        if (custImg = checkClientPosition(e)) {
            currentImg = custImg;
            inrange = true;
            movestart.y = e.clientY;
            movestart.x = e.clientX;
            originalPosition.x = custImg.img_x;
            originalPosition.y = custImg.img_y;
        }
    }).bind(clientEvents[1], function(e){
        if (moveTimer) {
          return;
        };
        moveTimer = setTimeout(function(){
            moveTimer = null;
        }, 17);
        move = true;
        var originEvent = e.originalEvent;
        if (currentImg == null) {
            return;
        }
        if (scale == false && e.type == 'touchmove' && originEvent.touches.length > 1) {
            scale = true;
            initScaleState(originEvent);
        } else if (originEvent.touches == null || originEvent.touches.length == 1) {
            scale = false;
        }
        var event = e.type == 'touchmove' ? originEvent.changedTouches[0] : e;
        if (scale) {
            return scaleHandler(event, originEvent);
        } else {
            return moveHandler(event, originEvent);
        }
    }).bind(clientEvents[2], function(e){
        focuson = false;
        inrange = false;
        scale = false;
        currentImg = null;
        if (move) {
            // 滑动事件 阻止冒泡
            e.stopPropagation();
            e.preventDefault();
            return false;
        } else {
            // 点击事件
            if (e.type == 'touchend') {
                e = e.originalEvent.changedTouches[0];
            }
            handleClick(e);
        }
    });
    $('#fileInput').bind('change', function(){
        var file = this.files[0];
        var cusImg = imgPositions[selectIndex].custImg;
        cusImg.set('img', file);
        cusImg.when(function(){
            // setSize before paint
            var p = imgPositions[selectIndex],
                img = p.custImg.img,
                img_w = img.width,
                img_h = img.height,
                p_w = p.w,
                p_h = p.h,
                p_x = p.x,
                p_y = p.y;
            p.img_w = img_w;
            p.img_h = img_h;
            if (img_h > img_w && img_h > p_h) {
                p.img_w = p_w;
                p.img_h = (p_w / img_w) * img_h;
            } else if (img_w > img_h && img_w > p_w){
                p.img_h = p_h;
                p.img_w = (p_h / img_h) * img_w;
            }
            p.img_x = p_x + (p_w - p.img_w) / 2;
            p.img_y = p_y + (p_h - p.img_h) / 2;
            // make center
            redraw();
        });
        $('#fileInput').val('');
    });
}());