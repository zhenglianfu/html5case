/**
 * Created by Administrator on 2015/5/13.
 */
$(function(){
    var $editor  = $('.svg-editor'),
        $panel = $editor.find('.panel-wrap'),
        $container = $('#panelContainers'),
        $menu  = $editor.find('.menu-bar'),
        $tool  = $editor.find('.tool-bar'),
        $bg    = $('.panel-bg'),
        panelMouse = {};
    function resizeEditor(){
        var height = window.document.documentElement.clientHeight - 20;
        $editor.height(height).width($editor.width());
        var menuHeight = $editor.find('.menu-bar').height();
        $tool.height(height - menuHeight - 2);
        $panel.height(height - menuHeight - 2);
    }
    // 画布类
    function Panel($container){
        this.$container = $($container);
        this.$el = $('<div class="panel" id="panel_' + (Panel.uuid ++) + '">').appendTo(this.$container);
        //this.$el = $('<div class="panel-content"></div>').appendTo(this.$panel);
        this.$svg = $(document.createElementNS(Panel.SVG_XML, 'svg')).attr({
            'xmlns:link': 'http://www.w3.org/1999/xlink',
            'xmlns': Panel.SVG_XML
        }).appendTo(this.$el);
        this.operaStack = []; /* 操作栈 记录所有操作 {x,y,w,h,innerHTML}*/
        this.restoreStack = []; /* 重做队列 记录被撤销的 , 再次保存时丢弃 */
        this.garbageFrames = []; /* 垃圾桶，回收被丢弃的快照 */
        this.events = {};
        this.clientRect = {};
        this.resizeListener = [];
        this.isShowGridGuides = false;
        this.isShowDrawGuides = false;
        this.init();
    };
    Panel.SVG_XML = 'http://www.w3.org/2000/svg';
    Panel.EDIT_MODE = {
        MOUSE: 'mouse',
        LINE: 'line',
        PEN: 'path',
        CIRCLE: 'circle',
        RESIZE: 'resize',
        MOVE: 'move',
        POLYGON: 'polygon',
        POLYLINE: 'polyline',
        TEXT: 'text',
        ELLIPSE : 'ellipse',
        RECT: 'rect'
    };
    Panel.EVENT = {
        BEFORE_SAVE: 'before_save',
        SAVE: 'save',
        BEFORE_RESTORE: 'before_restore',
        RESTORE: 'restore',
        BEFORE_REDO: 'before_redo',
        REDO: 'redo',
        MOUSE_MOVE: 'mousemove',
        CHANGE_SIZE_POSITION: 'change_size_position'
    };
    Panel.createSVGDom = function(tagName){
        // xml standard
        var tagName = tagName.toLowerCase();
        // TODO 添加所有SVG元素标签名img
        if (['line','g','text','tspan','path','circle','arc','ellipse','polygon','use','title','desc','defs','symbol','svg','image','a'].indexOf(tagName) > -1) {
            return document.createElementNS(Panel.SVG_XML, tagName.toLowerCase());
        }
        return null;
    };
    Panel.prototype = {
        minWidth : 30,
        minHeight: 30,
        init: function(){
            var w = this.$el.width() | 0,
                h = this.$el.height() | 0;
            this.$svg.attr({
                width:  w,
                height: h,
               'viewbox': '0 0 ' + w + ' ' + h
            });
            this.snapIndex = 0;
            this.clientRect.w = w;
            this.clientRect.h = h;
            this.clientRect.x = this.$el[0].offsetLeft;
            this.clientRect.y = this.$el[0].offsetTop;
            this._addRangeBlock();
            this._addBehavior();
            this.setSvgSizeAndPosition(this.clientRect.x, this.clientRect.y, w, h);
            this.editMode = Panel.EDIT_MODE.MOUSE;
            this.initialSnap  = this.currentSnap = this.snapshot();
            this.prepareSVGElement = null;
            this.strokeStyle = '#000';
            this.fillStyle = '#000';
            this.strokeWidth = 1;
            this.resizeAble = false;
            this.save();
        },
        _updateGridGuides: function(){
            var lineWidth = 0.5,
                space = 10,
                w = this.clientRect.w,
                h = this.clientRect.h,
                x = 0, y = 0, p = 0;
            // delete old guides
            this.$guides && this.$guides.remove();
            this.$guides = $(Panel.createSVGDom('g')).appendTo(this.$svg);
            this.$guides.attr('style', 'stroke-dasharray: 2; stroke-width: ' + lineWidth + '; stroke: #ccc').attr('id', 'gridGuides');
            var guidesHTML = [];
            // 水平
            for (p = space; p < h; p += space) {
                guidesHTML.push('<line x1="0" y1="' + (p + lineWidth) + '" x2="' + w + '" y2="' + (p + lineWidth) + '"></line>');
            }
            // vertical
            for (p = space; p < w; p += space) {
                guidesHTML.push('<line x1="' + (p + lineWidth) + '" x2="' + (p + lineWidth) + '" y1="0" y2="' + h + '"></line>');
            }
            this.$guides.html(guidesHTML.join(''));
        },
        // 显示网格辅助线
        showGridGuides: function(){
            if (this.isShowGridGuides === true) {
                this._updateGridGuides();
            } else {
                this.closeGirdGuides();
            }
        },
        closeGirdGuides: function(){
            this.isShowGridGuides = false;
            this.$guides && this.$guides.remove();
        },
        // 显示绘制辅助线
        _updateDrawGuides: function(relativePoint){
            if (this.isShowDrawGuides) {
                var style = 'stroke: #333; stroke-width: 1; stroke-dasharray: 1';
                this.$lineX = this.$lineX || $(Panel.createSVGDom('line')).appendTo(this.$svg);
                this.$lineY = this.$lineY || $(Panel.createSVGDom('line')).appendTo(this.$svg);
                this.$lineY.attr({
                    x1: 0,
                    x2: this.clientRect.w,
                    y1: relativePoint.y,
                    y2: relativePoint.y,
                    style: style
                }).show();
                this.$lineX.attr({
                    x1: relativePoint.x,
                    x2: relativePoint.x,
                    y1: 0,
                    y2: this.clientRect.h,
                    style: style
                }).show();
            }
        },
        closeDrawGuides: function(){
            // 清除辅助线
            this.$lineX = this.$lineX && this.$lineX.remove() && null;
            this.$lineY = this.$lineY && this.$lineY.remove() && null;
        },
        isSameSnapshot: function(shot_1, shot_2){
            if (shot_1 && shot_2) {
                return shot_1.html == shot_2.html && shot_1.x == shot_2.x && shot_1.y == shot_2.y && shot_1.w == shot_2.w && shot_1.h == shot_2.h;
            }
            return false;
        },
        save: function(){
            var snapshot = this.snapshot();
            if (this.isSameSnapshot(snapshot, this.operaStack[this.operaStack.length - 1])) {
                // no change
                console.log('has no any change');
            } else {
                this.trigger(Panel.EVENT.BEFORE_SAVE);
                // merge restoreStack to garbageFrames
                for (var i = 0, len = this.restoreStack.length; i < len; i++) {
                    this.garbageFrames.push(this.restoreStack[i]);
                }
                this.restoreStack = [];
                this.operaStack.push(snapshot);
                this.trigger(Panel.EVENT.SAVE);
            }
            return this;
        },
        // 撤销
        restore: function(){
            this.trigger(Panel.EVENT.BEFORE_RESTORE);
            this.restoreStack.push(this.operaStack.pop());
            this._updateSvgToSnapshot(this.operaStack[this.operaStack.length - 1] || this.initialSnap);
            this.trigger(Panel.EVENT.RESTORE);
        },
        // 重做
        redo: function(){
           this.trigger(Panel.EVENT.BEFORE_REDO);
           var snap = this.restoreStack.pop();
           this.operaStack.push(snap);
           this._updateSvgToSnapshot(snap);
           this.trigger(Panel.EVENT.REDO);
        },
        // 抓取当前快照
        snapshot: function(){
            var cTime = Date.now();
            return {
                x: this.clientRect.x,
                y: this.clientRect.y,
                w: this.clientRect.w,
                h: this.clientRect.h,
                html: this.$svg.html(),
                createTime: cTime,
                modifyTime: cTime,
                index: this.snapIndex++
            };
        },
        _updateSvgToSnapshot: function(snap){
            if (snap) {
                this.setSvgSizeAndPosition(snap.x, snap.y, snap.w, snap.h);
                this.$svg.html(snap.html || '');
            }
        },
        setSvgSizeAndPosition: function(x, y, w, h){
            if (arguments.length) {
                var x = (isNaN(x) ? this.clientRect.x : x) | 0,
                    y = (isNaN(y) ? this.clientRect.y : y) | 0,
                    w = (isNaN(w) ? this.clientRect.w : w) | 0,
                    h = (isNaN(h) ? this.clientRect.h : h) | 0;
                // changed
                if (x != this.clientRect.x || y != this.clientRect.y || w != this.clientRect.w || h != this.clientRect.h){
                    this.$svg.attr({
                        width: w,
                        height: h,
                        viewbox: '0 0 ' + w + ' ' + h
                    });
                    this.$el.css({
                        width: w,
                        height: h,
                        top: y,
                        left: x
                    });
                    // trigger
                    this.trigger(Panel.EVENT.CHANGE_SIZE_POSITION, [{
                        x: x,
                        y: y,
                        w: w,
                        h: h,
                        oldX: this.clientRect.x,
                        oldY: this.clientRect.y,
                        oldW: this.clientRect.w,
                        oldH: this.clientRect.h
                    }]);
                    this.clientRect.x = x;
                    this.clientRect.y = y;
                    this.clientRect.w = w;
                    this.clientRect.h = h;
                    // 更新网格
                    this.isShowGridGuides && this._updateGridGuides();
                }
            }
            return $.extend({}, this.clientRect);
        },
        /* 绘图行为 */
        _addBehavior: function(){
            var startPoint = {};
            var endPoint = {};
            var clickDown = false;
            var self = this;
            var tagName = ''; // 选中的元素是什么
            this.$el.bind('mousedown', function(e){
                clickDown = true;
                startPoint = getRelativeSVGPoint(e);
                // 绘制辅助
                self._updateDrawGuides(startPoint);
                // start move
                self.moveStartHandler(startPoint);
                return (tagName = e.target.tagName.toUpperCase()) == 'DIV';
            }).bind('mousemove', function(e){
                var movePoint = getRelativeSVGPoint(e);
                if (clickDown) {
                    self.moveHandler(startPoint, movePoint);
                    self._updateDrawGuides(movePoint);
                }
                self.trigger(Panel.EVENT.MOUSE_MOVE, [movePoint]);
                return tagName == 'DIV';
            }).bind('mouseup', function(e){
                clickDown = false;
                endPoint = getRelativeSVGPoint(e);
                self.moveEndHandler(startPoint, endPoint);
                self.closeDrawGuides();
                return tagName == 'DIV';
            }).bind('dblclick', function(e){
                self.dbClickHandler(startPoint, getRelativeSVGPoint(e));
            });
            function getRelativeSVGPoint(e){
                return {
                    clientX : e.clientX | 0,
                    clientY : e.clientY | 0,
                    x : ((window.pageXOffset || window.document.body.scrollLeft) + e.clientX - self.$svg.offset().left) | 0,
                    y : ((window.pageYOffset || window.document.body.scrollTop) + e.clientY - self.$svg.offset().top) | 0
                }
            }
        },
        destroy: function(){
            this.$el.remove();
        },
        _addRangeBlock: function(){
            var pos = 'top,left,right,bottom,ne,nw,se,sw'.split(',');
            for (var i = 0, len = pos.length; i < len; i++) {
                this.$el.append('<div class="resize-bar ' + pos[i] + '" data-direction="' + pos[i] + '"></div>');
            }
            this.__addResizeEvent(this.$el);
        },
        // common event listener interface
        on: function(type, listener){
            var listeners = this.events[type];
            if (listeners == null) {
                this.events[type] = listeners = [];
            }
            if (typeof listener === 'function') {
                listeners.push(listener);
            }
            return this;
        },
        /* eventName, [arg1, arg2] */
        trigger: function(type, args){
            var listeners = this.events[type];
            if (listeners) {
                for (var i = 0, len = listeners.length; i < len; i++) {
                    // 返回false停止执行监听队列
                    if (listeners[i].apply(this, args) === false) {
                        break;
                    }
                }
            }
        },
        __addResizeEvent: function(){
            var self = this;
            var drag = false;
            var direction = '';
            var mouse = {};
            var rect = {};
            var offset = {};
            var $el = this.$el;
            var minWidth = this.minWidth;
            var minHeight = this.minHeight;
            this.$el.find('.resize-bar').bind('mousedown', function(e){
                drag = true;
                direction = $(this).attr('data-direction');
                mouse = getMousePosition(e);
                rect.height = $el.height();
                rect.width = $el.width();
                offset.left = rect.left = parseInt($el.css('left'));
                offset.top = rect.top = parseInt($el.css('top'));
            });
            $('#panelContainers').off('mousemove').bind('mousemove', handlerMove);
            this.$container.bind('mouseup', function(e){
                if (drag) {
                    drag = false;
                    // 调整之后入栈
                    self.save();
                }
            });
            this.events['#panelContainers.mousemove'] = handlerMove;
            var $svg = this.$svg;
            // 控制在最大最小值范围内
            var adjustSize = function(style, value, distance){
                var direction = '',
                    accordValue = 0;
                if (style == 'width') {
                    accordValue = minWidth;
                    direction = 'left';
                } else {
                    accordValue = minHeight;
                    direction = 'top';
                }
                if (value < accordValue) {
                    $el[style](accordValue);
                } else {
                    var css = {};
                    css[direction] = distance + 'px';
                    distance === undefined ? '' : $el.css(css);
                    $el[style](value);
                    distance && (offset[direction] = distance);
                }
            };
            // resize height width left top
            function handlerMove(e){
                if (drag == false) {
                    return;
                }
                e.preventDefault();
                var nowPosition = getMousePosition(e);
                var h = rect.height;
                var w = rect.width;
                var x = offset.left;
                var y = offset.top;
                switch (direction){
                    case "top":
                        h = rect.height + mouse.y - nowPosition.y;
                        adjustSize('height', h, rect.top + nowPosition.y - mouse.y);
                        break;
                    case "bottom":
                        h = rect.height + (nowPosition.y - mouse.y);
                        adjustSize('height', h);
                        break;
                    case "left":
                        w = rect.width + (mouse.x - nowPosition.x);
                        adjustSize('width', w, rect.left + (nowPosition.x - mouse.x));
                        break;
                    case "right":
                        w = rect.width + (nowPosition.x - mouse.x);
                        adjustSize('width', w);
                        break;
                    case "nw":
                        h = rect.height + mouse.y - nowPosition.y;
                        adjustSize('height', h, rect.top + nowPosition.y - mouse.y);
                        w = rect.width + (mouse.x - nowPosition.x);
                        adjustSize('width', w, rect.left + (nowPosition.x - mouse.x));
                        break;
                    case "ne":
                        h = rect.height + mouse.y - nowPosition.y;
                        adjustSize('height', h, rect.top + nowPosition.y - mouse.y);
                        w = rect.width + (nowPosition.x - mouse.x);
                        adjustSize('width', w);
                        break;
                    case "se":
                        h = rect.height + (nowPosition.y - mouse.y);
                        adjustSize('height', h);
                        w = rect.width + (nowPosition.x - mouse.x);
                        adjustSize('width', w);
                        break;
                    case "sw":
                        h = rect.height + (nowPosition.y - mouse.y);
                        adjustSize('height', h);
                        w = rect.width + (mouse.x - nowPosition.x);
                        adjustSize('width', w, rect.left + (nowPosition.x - mouse.x));
                        break;
                }
                w = Math.max(w, minWidth) | 0;
                h = Math.max(h, minHeight) | 0;
                self.setSvgSizeAndPosition(offset.left, offset.top, w, h);
            }
        },
        /* TODO 绘制水平垂直线 shift + */
        /* TODO 绘制折线 <polygon> */
        moveStartHandler: function(point){
            if (this.prepareSVGElement) {
                this.$svg.append(this.prepareSVGElement);
                this.drawSimpleElement(point, point);
            }
        },
        moveHandler: function(start, current){
            this.drawSimpleElement(start, current);
        },
        moveEndHandler: function(start, end){
            // 快照入栈
            this.save();
            // add new element
            this.prepareSVGElement = $(Panel.createSVGDom(this.editMode));
        },
        // 双击才能结束
        dbClickHandler: function(){

        },
        /* line rect circle */
        drawSimpleElement: function(start, end){
            var style = 'fill:' + this.fillStyle + ';stroke:' + this.strokeStyle + ';stroke-width:' + this.strokeWidth + ';';
            switch (this.editMode) {
                case Panel.EDIT_MODE.MOVE:
                    this.setSvgSizeAndPosition(this.clientRect.x + (end.x - start.x), this.clientRect.y + (end.y - start.y), this.clientRect.w, this.clientRect.h);
                    break;
                case Panel.EDIT_MODE.LINE:
                    this.prepareSVGElement.attr({
                        x1: start.x,
                        x2: end.x,
                        y1: start.y,
                        y2: end.y,
                        style: style
                    });
                    break;
                default:
                    // complicated
            }
        },
        setMode: function(mode){
            // change mode
            if (mode && this.editMode != mode) {
                this.editMode = mode;
                this.setResizeAble(false); /* 取消更改尺寸模式 */
                switch (this.editMode) {
                    case Panel.EDIT_MODE.RESIZE:
                        this.setResizeAble(this.editMode);
                    case Panel.EDIT_MODE.MOUSE:
                    case Panel.EDIT_MODE.MOVE:
                        this.prepareSVGElement = null;
                        break;
                    case Panel.EDIT_MODE.LINE:
                        this.prepareSVGElement = $(Panel.createSVGDom(Panel.EDIT_MODE.LINE));
                        break;
                    case Panel.EDIT_MODE.CIRCLE:
                        this.prepareSVGElement = $(Panel.createSVGDom(Panel.EDIT_MODE.CIRCLE));
                        break;
                    case Panel.EDIT_MODE.ELLIPSE:
                        this.prepareSVGElement = $(Panel.createSVGDom(Panel.EDIT_MODE.ELLIPSE));
                        break;

                }
            }
        },
        clear: function(){
            this.$svg.html('');
            this.showGridGuides();
        },
        setResizeAble: function(resize){
            this.resizeAble = resize = !!resize;
            if (resize) {
                this.$el.addClass('resize').find('.resize-bar').css('display', 'block');
            } else {
                this.$el.removeClass('resize').find('.resize-bar').css('display', 'none');
            }
        },
        outputSVGHTML: function(){
            return this.$svg[0].outerHTML;
        }
    };
    Panel.uuid = 0;
    /* SVG DOM */
    function SVGDomEntity(svgElement) {
        if (typeof svgElement === 'string') {
            svgElement = Panel.createSVGDom(svgElement);
        }
        this.$svgElement = $(svgElement);
        this.tagName = this.$svgElement.length ? this.$svgElement[0].tagName.toLowerCase() : 'unknown';
    }
    SVGDomEntity.prototype = {
        update: function(){

        }
    };
    // 全屏
    function fullScreen(ele){
        if (ele.webkitRequestFullScreen) {
            ele.webkitRequestFullScreen();
        }else if(ele.mozRequestFullScreen) {
            ele.mozRequestFullScreen();
        } else if(ele.requestFullScreen) {
            ele.requestFullScreen();
        } else {
            alert("无法全屏");
        }
    }
    function getMousePosition(e){
        return {
            x: (window.pageXOffset || window.document.body.scrollLeft) + e.clientX,
            y: (window.pageYOffset || window.document.body.scrollTop) + e.clientY,
            clientX: e.clientX,
            clientY: e.clientY
        }
    }
    var SVGTool = {
        $container: $('.editor-panel'),
        showGridGuides: false,
        showDrawGuides: false,
        index : 0,
        currentPanel: null,
        init : function(){
            this.bindEvent();
        },
        /* add a new Panel */
        addPanel: function() {
            var $panels = $panel.find('.panel:visible');
            if ($panels.length) {
                if (window.confirm("这将清除原先的工作，继续？")) {
                    $container.html('');
                    _add();
                }
            } else {
                _add();
            }
            function _add(){
                $('.tool-item').removeClass('active');
                SVGTool.currentPanel=  new Panel($container);
                SVGTool.updateSizeInfo(SVGTool.currentPanel.setSvgSizeAndPosition());
                // 监听panel事件, 撤销 重做状态
                function listener() {
                    SVGTool.updateSnapCtrlStatus(this.operaStack.length, this.restoreStack.length);
                }
                SVGTool.currentPanel.on(Panel.EVENT.SAVE, listener).on(Panel.EVENT.RESTORE, listener).on(Panel.EVENT.REDO, listener).on(Panel.EVENT.MOUSE_MOVE, function(point){
                    $('#mouse_x').text(point.x);
                    $('#mouse_y').text(point.y);
                }).on(Panel.EVENT.CHANGE_SIZE_POSITION, SVGTool.updateSizeInfo);
                SVGTool.updateSnapCtrlStatus(0, 0);
                SVGTool.currentPanel.isShowGridGuides = SVGTool.showGridGuides;
                SVGTool.currentPanel.showGridGuides();
            }
        },
        updateSnapCtrlStatus: function(operaLen, restoreLen){
            if (operaLen > 1) {
                $('#revert').removeClass('disabled');
            } else {
                $('#revert').addClass('disabled');
            }
            if (restoreLen > 0) {
                $('#redo').removeClass('disabled');
            } else {
                $('#redo').addClass('disabled');
            }
        },
        updateSizeInfo: function(clientRect){
            $('#svg_x').val(clientRect.x);
            $('#svg_y').val(clientRect.y);
            $('#svg_w').val(clientRect.w);
            $('#svg_h').val(clientRect.h);
        },
        menuHandler : function(name){
            switch (name) {
                case "add":
                    this.addPanel();
                    break;
                case "fullScreen":
                    fullScreen($editor[0]);
                    break;
                case 'clear':
                    this.currentPanel && this.currentPanel.clear();
                    break;
                case 'toggleGridGuides':
                    SVGTool.currentPanel.isShowGridGuides = SVGTool.showGridGuides = !SVGTool.showGridGuides;
                    SVGTool.currentPanel.showGridGuides();
                    $('#toggleGridGuides').text(SVGTool.showGridGuides ? '关闭坐标线' : '开启坐标线');
                    break;
                case 'toggleDrawGuides':
                    SVGTool.currentPanel.isShowDrawGuides = SVGTool.showDrawGuides = !SVGTool.showDrawGuides;
                    $('#toggleDrawGuides').text(SVGTool.showDrawGuides ? '关闭辅助线' : '开启辅助线');
                    break;
                case 'code':
                    SVGTool.showCode(SVGTool.currentPanel.outputSVGHTML());
                    break;
                case 'revert':
                    this.currentPanel.restore();
                    break;
                case 'redo':
                    this.currentPanel.redo();
                    break;
                default:
                    console.warn('unregistered function');
                    break;
            }
        },
        showCode: function(html){
            var $codeDisplay = $('<div>').addClass('code-container').html('<div><button type="button" class="btn">关闭</button>></div><div class="code-content"><pre><code class="lang-html code"></code></pre></div>');
            $codeDisplay.find('code').text(this.formatHTML(html));
            $codeDisplay.find('button').bind('click', function(){
                $codeDisplay.remove();
            });
            $codeDisplay.appendTo(this.$container);
        },
        /* 格式化代码 */
        formatHTML: function(html){
            var tab = '    ',
                tabs = '',
                formatHTML = '',
                nextLine = '\n',
                regPrefix = /<[a-z0-9]+.*?>[^<]*/g,
                regSuffix = /<\/[a-z0-9]+>/g,
                regTag = /<\/?([a-z0-9]+)[^>]*\/?>/,
                prefixStack = html.match(regPrefix),
                suffixStack = html.match(regSuffix),
                deepth = 0,
                stackIndex = 0,
                fragment = '',
                text = '',
                currentTag = '',
                waitTag = '';
            while(prefixStack.length || stackIndex < prefixStack.length || suffixStack.length){
                appendHTML();
            }
            function appendHTML(){
                fragment = prefixStack[stackIndex];
                if (fragment) {
                    text = fragment.substr(fragment.indexOf('>') + 1);
                    fragment = fragment.substring(0, fragment.indexOf('>') + 1);
                    currentTag = getTagName(fragment);
                    waitTag = getTagName(suffixStack[0]);
                    // append html
                    formatHTML += getTab(deepth) + fragment + (text ? nextLine + getTab(deepth + 1) + text + nextLine + getTab(deepth): '');
                    // 自结束
                    if (fragment.indexOf('/>') > -1) {
                        prefixStack.splice(stackIndex, 1);
                        deepth--;
                    } else if (currentTag == waitTag) {
                        // match
                        // do
                        formatHTML += suffixStack[0] + nextLine;
                        suffixStack.splice(0, 1);
                        prefixStack.splice(stackIndex--, 1);

                        while (suffixStack.length && getTagName(prefixStack[stackIndex++]) == getTagName(suffixStack[0])) {
                            // 深度递减
                            deepth--;
                            formatHTML += getTab(deepth) + suffixStack[0] + nextLine;
                            // 成对移除
                            suffixStack.splice(0, 1);
                            prefixStack.splice(--stackIndex, 1);
                        };
                    } else {
                        deepth ++;
                        stackIndex++;
                        formatHTML += (text ? '' : nextLine);
                    }
                } else {
                    // 只剩后缀
                    formatHTML += getTab(deepth--) + suffixStack[0] + nextLine;
                    suffixStack.splice(0, 1);
                }
            }
            function getTab(deepth){
                var tabs = [];
                tabs.length = Math.max(deepth + 1, 0);
                return tabs.join(tab);
            }
            function getTagName(tag){
                if (tag) {
                    return tag.match(regTag)[1];
                }
                return '';
            }
            return formatHTML;
        },
        bindEvent : function(){
            var that = this;
            $tool.on('click', 'li.tool-item', function(){
                if ($container.find('.panel').length == 0) {
                    return false;
                }
                if ($(this).hasClass('active')) {
                    return false;
                }
                $tool.find('.tool-item').removeClass('active');
                $(this).addClass('active');
                var mod = this.id || 'unknow';
                $container.find('.panel').attr('class', 'panel ' + mod);
                SVGTool.currentPanel.setMode(mod);
            });
            $menu.on('click', '.menu-item', function(){
                if ($(this).hasClass('disabled')) {
                    return false;
                }
                that.menuHandler(this.id);
            });
            $container.on('mousedown mousemove', '.panel', function(e){
                var cx = e.clientX,
                    cy = e.clientY,
                    offset = $(this).offset();
                panelMouse.x = cx + (window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft) - offset.left;
                panelMouse.y = cy + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop) - offset.top;
            });
            // x,y,w,h control
            $('#svg_x, #svg_h, #svg_w, #svg_y').bind('change', function(){
                that.currentPanel && that.currentPanel.setSvgSizeAndPosition(+$('#svg_x').val(), +$('#svg_y').val(), +$('#svg_w').val(), +$('#svg_h').val());
            });
        }
    };
    SVGTool.init();
    resizeEditor();
});