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
    /* SVG DOM */
    function SVGDomEntity(svgElement, defaultStyle) {
        this.id = SVGDomEntity.uuid ++;
        this.points = []; // 路径点
        this.element = null;
        this.length = 0;
        this.guideArea = null;
        this.showGuideLines = false;
        this.focus = false;
        this.panel = null;
        this.currentPoint = null;
        this.stylesheet = $.extend({}, defaultStyle);
        if (typeof svgElement === 'string') {
            svgElement = SVGDomEntity.createSVGDom(svgElement);
        }
        if (svgElement) {
            this.tagName = svgElement.tagName.toLowerCase();
            this.valid = true;
        } else {
            this.tagName = '';
            this.valid = false;
        }
    }
    SVGDomEntity.createSVGDom = function(tagName, attr){
        if (tagName) {
            // xml standard
            var tagName = tagName.toLowerCase();
            // TODO 添加所有SVG元素标签名
            if (['line','rect', 'g','text','tspan','path','clipPath','circle','arc','ellipse','polygon','polyline','use','marker','title','desc','defs','symbol','svg','image'].indexOf(tagName) > -1) {
                var dom = document.createElementNS(Panel.SVG_XML, tagName);
                for (var i in attr) {
                    dom.setAttribute(i, attr[i]);
                }
                return dom;
            }
        }
        return null;
    };
    SVGDomEntity.prototype = {
        // 绘制显示区域的矩形
        showGuideArea: function(start, end){
            if (this.element) {
                var miniRect = this.element.getBBox();
            }
        },
        removeGuideArea: function(){
            $(this.guideArea).remove();
            this.guideArea = null;
        },
        update: function(){},
        render: function(start, end){
            $(this.element).attr('style', this._stylesheet2str());
        },
        _stylesheet2str: function(){
            var kvs =  [],
                i = 0;
            for (var name in this.stylesheet) {
                kvs[i++] = name + ':' + this.stylesheet[name];
            }
            return kvs.join(';');
        },
        setStyle: function(name, value){
            if (typeof name === 'object') {
                for (var i in name) {
                    value = name[i];
                    this.stylesheet[i] = typeof value === 'function' ? value() : value;
                }
            } else {
                this.stylesheet[name] = typeof value === 'function' ? value() : value;
            }
        },
        next: function(start, end){
            // 保存路径点
            if (this.currentPoint == null) {
                if (start.x == end.x && start.y == start.y) {
                    this.points[0] = end;
                } else {
                    this.points[0] = start;
                    this.points[1] = end;
                }
            } else if (this.currentPoint.x != end.x || this.currentPoint.y != end.y) {
                this.points.push(end);
            }
            this.currentPoint = end;
            return this;
        },
        // 多点路径使用该方法结束
        finish: function(start, lastPoint){
            if (this.element) {
                // 显示区域为空则移除
                var rect = this.element.getBBox();
                if (rect.width == 0 && rect.height == 0) {
                    $(this.element).remove();
                }
            }
            return this;
        },
        create: function(){
            // only create once
            if (this.valid && this.element == null) {
                this.element = SVGDomEntity.createSVGDom(this.tagName);
            }
        },
        _bindEvent: function(){
            var self = this;
            $(this.element).bind('click', function(){
                alert(this.tagName);
                self.focus = true;
                self.panel.$select = self;
                SVGDomEntity.EVENT_HANDLERS.CLICK_HANDLER.apply(self, arguments);
            });
        },
        onAddToPanelOnce: function(panel){
            this.onAddToPanelOnce = function(){};
            this.panel = panel;
            this._bindEvent();
        },
        getElement: function(){
            return this.element;
        },
        remove: function(){
            this.element && this.panel && $(this.element).remove();
        },
        destroy: function(){
            $(this.element).off('click');
            this.remove();
            for (var i in this) {
                if (this.hasOwnProperty(i)) {
                    this[i] = null;
                }
            }
        }
    };
    SVGDomEntity.EVENT_HANDLERS = {
        CLICK_HANDLER: function(){

        }
    };
    SVGDomEntity.DEFAULT_STYLE = {
        fill: '#000',
        stroke: '#000',
        'stroke-width': 1,
        'stroke-opacity': 1,
        'stroke-dasharray': 0
    };
    /*
     * 扩展SVGDomEntity, 自定义SVG绘制类型
     * */
    SVGDomEntity.extend = function(tagName, properties, defaultStyle){
        defaultStyle = $.extend({}, SVGDomEntity.DEFAULT_STYLE, defaultStyle);
        var instance = new SVGDomEntity(tagName, defaultStyle),
            ParticularSVGDomEntity = function(style){
                // super constructor
                SVGDomEntity.apply(this, [tagName, $.extend(defaultStyle, style)]);
            },
            proto = function(){
                var p = {};
                for (var i in instance) {
                    // 只继承原型链
                    if (instance.hasOwnProperty(i)) {
                        continue;
                    }
                    if (typeof instance[i] === 'function') {
                        if (typeof properties[i] === 'function') {
                            p[i] = function(super_fn, c_fn){
                                return function(){
                                    super_fn.apply(this, arguments); // super
                                    return c_fn.apply(this, arguments);
                                };
                            }(instance[i], properties[i])
                        } else {
                            p[i] = instance[i];
                        }
                    } else {
                        p[i] = properties.hasOwnProperty(i) ? properties[i] : instance[i];
                    }
                }
                return p;
            }();
        proto.constructor = ParticularSVGDomEntity;
        ParticularSVGDomEntity.prototype = proto;
        return ParticularSVGDomEntity;
    };
    SVGDomEntity.uuid = 0;
    SVGDomEntity.EXTENDS = {
        LINE: SVGDomEntity.extend('line', {
            render: function(start, end, clickDown) {
                $(this.element).attr({
                    'x1': start.x,
                    'x2': end.x,
                    'y1': start.y,
                    'y2': end.y
                });
            },
            next: function(start, end){
                var rect = this.element.getBBox();
                if (rect.width == 0 && rect.height == 0) {
                    $(this.element).remove();
                }
                // 另起一条新线段
                return new SVGDomEntity.EXTENDS.LINE(this.stylesheet);
            }
        }),
        ARROW_LINE: SVGDomEntity.extend('line', {
            onAddToPanelOnce: function(panel){
                if (panel.$defs == null) {
                    panel.$defs = $(SVGDomEntity.createSVGDom('defs')).appendTo(panel.$svg);
                }
                var makerId = this.markerId  = 'arrow_marker_' + Date.now();
                var $marker = this.$marker = $(SVGDomEntity.createSVGDom('marker', {
                    id: makerId,
                    markerWidth: 4,
                    markerHeight: 8,
                    orient: 'auto',
                    refX: 4,
                    refY: 4
                })).html('<path d="M0,0 4,4 0,8" style="fill:none; stroke:' + this.stylesheet.stroke + '"></path>');
                panel.$defs.append($marker);
            },
            render: function(start, end){
                if (this.element) {
                    $(this.element).attr({
                        x1: start.x,
                        y1: start.y,
                        x2: end.x,
                        y2: end.y
                    });
                }
            },
            next: function(){
                var rect = this.element.getBBox();
                if (rect.width == 0 && rect.height == 0) {
                    $(this.element).remove();
                } else {
                    $(this.element).attr('style', $(this.element).attr('style') + ';marker-end: url(#' + this.markerId + ')');
                }
                return new SVGDomEntity.EXTENDS.ARROW_LINE(this.style);
            }
        }),
        RECT: SVGDomEntity.extend('rect', {
            render: function(start, end){
                var x = Math.min(start.x, end.x),
                    y = Math.min(start.y, end.y);
                $(this.element).attr({
                    x: x,
                    y: y,
                    width: Math.abs(end.x - start.x),
                    height: Math.abs(end.y - start.y)
                });
            },
            next: function(start, end){
                return new SVGDomEntity.EXTENDS.RECT(this.stylesheet);
            }
        }),
        POLYLINE: SVGDomEntity.extend('polyline', {
            render: function(start, end){
                var tempPoints = this.points.length ? this.points.concat(end) : this.points.concat([start, end]),
                    points = [];
                for (var i = 0, len = tempPoints.length; i < len; i += 1) {
                    points[i] = tempPoints[i].x + ',' + tempPoints[i].y;
                }
                $(this.element).attr('points', points.join(' '));
            },
            next: function(start, next, clickDown){
                return this;
            },
            finish: function(start, lastPoint){
                var points = [];
                for (var i = 0, len = this.points.length; i < len; i += 1) {
                    points[2 * i] = this.points[i].x;
                    points[2 * i + 1] = this.points[i].y;
                }
                $(this.element).attr('points', points.join(' '));
                return new SVGDomEntity.EXTENDS.POLYLINE(this.stylesheet);
            }
        }, {
            fill: 'none'
        }),
        CIRCLE: SVGDomEntity.extend('circle', {
           render: function(start, end){
               var r = Math.max(Math.abs(start.x - end.x), Math.abs(start.y - end.y)) / 2,
                   cx = end.x > start.x ? start.x + (end.x - start.x) / 2 : end.x + (start.x - end.x) / 2,
                   cy = end.y > start.y ? start.y + (end.y - start.y) / 2 : end.y + (start.y - end.y) / 2;
               $(this.element).attr({
                   cx: cx,
                   cy: cy,
                   r: r
               });
           },
           next: function(start, end){
               return new SVGDomEntity.EXTENDS.CIRCLE(this.stylesheet);
           }
        })
    };
    if (location.host.indexOf('localhost') > -1) {
        // 测试用
        window.SVGDOM = SVGDomEntity;
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
        this.$select = null;
        this.focus = false;
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
        RECT: 'rect',
        CLIP_PATH: 'clipPath',
        GROUP: 'g'
    };
    Panel.SVG_DOM_NAME_REFER = {
        'line': SVGDomEntity.EXTENDS.LINE,
        'arrowLine': SVGDomEntity.EXTENDS.ARROW_LINE,
        'path': SVGDomEntity.EXTENDS.LINE,
        'rect': SVGDomEntity.EXTENDS.RECT,
        'text': SVGDomEntity.EXTENDS.LINE,
        'circle': SVGDomEntity.EXTENDS.CIRCLE,
        'ellipse': SVGDomEntity.EXTENDS.LINE,
        'polygon': SVGDomEntity.EXTENDS.LINE,
        'polyline': SVGDomEntity.EXTENDS.POLYLINE,
        'g': SVGDomEntity.EXTENDS.LINE,
        'maker': SVGDomEntity.EXTENDS.LINE,
        'defs': SVGDomEntity.EXTENDS.LINE,
        'clipPath': SVGDomEntity.EXTENDS.LINE
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
            this.canvasId = 'canvas_' + Date.now();
            this.$canvas = $(SVGDomEntity.createSVGDom('g')).attr('id', this.canvasId).appendTo(this.$svg);
            this.$defs = null;
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
            this.currentDomEntity = null;
            // svg global style
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
            this.$guides = $(SVGDomEntity.createSVGDom('g')).appendTo(this.$svg);
            this.$guides.attr('style', 'stroke-dasharray: 2; stroke-width: ' + lineWidth + '; stroke: #ccc').prop('id', 'gridGuides_' + Date.now()).addClass('guideLines');
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
        _GUIDES_STYLE: 'stroke: #333; stroke-width: 1; stroke-dasharray: 1',
        _updateDrawGuides: function(relativePoint){
            if (this.isShowDrawGuides) {
                this.$lineX = this.$lineX || $(SVGDomEntity.createSVGDom('line')).addClass('guideLines').prop('id', 'drawGuides_x_' + Date.now()).appendTo(this.$svg);
                this.$lineY = this.$lineY || $(SVGDomEntity.createSVGDom('line')).addClass('guideLines').prop('id', 'drawGuides_y_' + Date.now()).appendTo(this.$svg);
                this.$lineY.attr({
                    x1: 0,
                    x2: this.clientRect.w,
                    y1: relativePoint.y,
                    y2: relativePoint.y,
                    style: this._GUIDES_STYLE
                }).show();
                this.$lineX.attr({
                    x1: relativePoint.x,
                    x2: relativePoint.x,
                    y1: 0,
                    y2: this.clientRect.h,
                    style: this._GUIDES_STYLE
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
                return shot_1.htmlMD5 == shot_2.htmlMD5 && shot_1.x == shot_2.x && shot_1.y == shot_2.y && shot_1.w == shot_2.w && shot_1.h == shot_2.h;
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
        clear: function(){
            this.$canvas.html('');
            this.showGridGuides();
            // 清空后入栈
            this.save();
        },
        delete: function(svgDom){
            if (this.$select) {
                this.$select.remove();
                this.save();
            }
        },
        // 抓取当前快照
        snapshot: function(){
            var cTime = Date.now();
            return {
                x: this.clientRect.x,
                y: this.clientRect.y,
                w: this.clientRect.w,
                h: this.clientRect.h,
                htmlMD5: $.md5(this.$canvas.html()), // keep it short
                nodes: this.$canvas.children(),
                createTime: cTime,
                modifyTime: cTime,
                index: this.snapIndex++,
                svgDOMEntity: this.currentDomEntity
            };
        },
        _updateSvgToSnapshot: function(snap){
            if (snap) {
                this.setSvgSizeAndPosition(snap.x, snap.y, snap.w, snap.h);
                this.$canvas.html('').append(snap.nodes);
            }
        },
        /* 响应鼠标事件 */
        _addBehavior: function(){
            var startPoint = {};
            var endPoint = {};
            var clickDown = false;
            var self = this;
            var tagName = ''; // 选中的元素是什么
            var focus = false;
            var lastMouseUpTime = Date.now();
            this.$el.bind('mousedown', function(e){
                focus = true;
                clickDown = true;
                startPoint = self.getRelativeSVGPoint(e);
                // 绘制辅助
                self._updateDrawGuides(startPoint);
                // start move
                self.moveStartHandler(startPoint);
                return (tagName = e.target.tagName.toUpperCase()) == 'DIV';
            }).bind('mousemove', function(e){
                var currentPoint = self.getRelativeSVGPoint(e);
                self.moveHandler(startPoint, currentPoint, clickDown);
                self.trigger(Panel.EVENT.MOUSE_MOVE, [currentPoint]);
                return tagName == 'DIV';
            }).bind('mouseup', function(e){
                clickDown = false;
                endPoint = self.getRelativeSVGPoint(e);
                self.closeDrawGuides();
                var now = Date.now();
                // 300ms内算双击
                if (now - lastMouseUpTime < 300) {
                    // double click
                    self.dbClickHandler(startPoint, endPoint);
                } else {
                    self.moveEndHandler(startPoint, endPoint);
                }
                lastMouseUpTime = now;
                return tagName == 'DIV';
            });
        },
        getRelativeSVGPoint: function(e){
            return {
                clinetX: e.clientX | 0,
                clientY: e.clientY | 0,
                x: ((window.pageXOffset || window.document.body.scrollLeft) + e.clientX - this.$svg.offset().left) | 0,
                y: ((window.pageYOffset || window.document.body.scrollTop) + e.clientY - this.$svg.offset().top) | 0
            };
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
            if (this.currentDomEntity) {
                this.currentDomEntity.create();
                this.currentDomEntity.onAddToPanelOnce(this);
                this.$canvas.append(this.currentDomEntity.getElement());
                this.currentDomEntity.render(point, point);
            }
        },
        moveHandler: function(start, current, clickDown){
            if (clickDown) {
                this._updateDrawGuides(current);
            }
            this.currentDomEntity ? this.currentDomEntity.render(start, current, clickDown) : this.driftPanel(start, current, clickDown);
        },
        moveEndHandler: function(start, end){
            if (this.currentDomEntity) {
                this.currentDomEntity.render(start, end);
                this.currentDomEntity = this.currentDomEntity.next(start, end);
            }
            // 快照入栈
            this.save();
        },
        // 多点路径元素 双击才能结束
        dbClickHandler: function(start, lastPoint){
            if (this.currentDomEntity) {
                this.currentDomEntity = this.currentDomEntity.finish(start, lastPoint);
            }
            this.save();
        },
        // 按起按键
        keyUpHandler: function(){
        },
        // 按下按键
        keyDownHandler: function(e){
        },
        keyPressHandler: function(){
        },
        /* 位移画布 */
        driftPanel: function(start, end, clickDown){
            if (clickDown) {
                switch (this.editMode) {
                    case Panel.EDIT_MODE.MOVE:
                        this.setSvgSizeAndPosition(this.clientRect.x + (end.x - start.x), this.clientRect.y + (end.y - start.y), this.clientRect.w, this.clientRect.h);
                        break;
                    default:
                    // nothing
                }
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
                        this.currentDomEntity = null;
                        break;
                    case Panel.EDIT_MODE.LINE:
                    case Panel.EDIT_MODE.RECT:
                    case Panel.EDIT_MODE.CIRCLE:
                    case Panel.EDIT_MODE.POLYLINE:
                    case Panel.EDIT_MODE.POLYGON:
                    case Panel.EDIT_MODE.CLIP_PATH:
                    case Panel.EDIT_MODE.ELLIPSE:
                    case Panel.EDIT_MODE.ARROW_LINE:
                    default:
                        this.currentDomEntity = new Panel.SVG_DOM_NAME_REFER[mode](this.styles);
                        break;
                }
            }
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
            var $copy = this.$svg.clone();
            $copy.find('.guideLines').remove();
            return $copy[0].outerHTML;
        }
    };
    Panel.uuid = 0;
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
            while((prefixStack.length && stackIndex < prefixStack.length) || suffixStack.length){
                appendHTML();
            }
            function appendHTML(){
                fragment = $.trim(prefixStack[stackIndex]);
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
                        while (suffixStack.length && getTagName(prefixStack[stackIndex]) == getTagName(suffixStack[0])) {
                            // 往根节点向上递减，找父节点
                            deepth--;
                            formatHTML += getTab(deepth) + $.trim(suffixStack[0]) + nextLine;
                            // 成对移除
                            suffixStack.splice(0, 1);
                            prefixStack.splice(stackIndex--, 1);
                        };
                        stackIndex ++;
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
            // 工具栏
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
            // 键盘事件
            $(window).bind('keydown', function(e){
                SVGTool.currentPanel.keyDownHandler(e);
            }).bind('keyup', function(e){
                SVGTool.currentPanel.keyUpHandler(e);
            }).bind('keypress', function(e){
                SVGTool.currentPanel.keyPressHandler(e);
            });
            // 顶部菜单
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
            $('.color').bind('click', function(){

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