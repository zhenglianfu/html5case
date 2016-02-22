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
    function Panel(){
        this.$el = $('<div class="panel" id="panel_' + (Panel.uuid ++) + '">').appendTo($container);
        //this.$el = $('<div class="panel-content"></div>').appendTo(this.$panel);
        this.$svg = $('<svg xmlns="http://www.w3.org/2000/svg">').appendTo(this.$el);
        this.operaStack = [], /* 操作栈 记录所有操作 {x,y,w,h,innerHTML}*/
        this.revertQueue = [], /* 重做队列 记录被撤销的 */
        this.events = {};
        this.clientRect = {};
        this.resizeListener = [];
        this.init();
    };
    Panel.EDIT_MODE = {
        MOUSE: 'mouse',
        LINE: 'line',
        PEN: 'pen',
        CIRCLE: 'circle'
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
            this.clientRect.w = w;
            this.clientRect.h = h;
            this.clientRect.x = this.$el[0].offsetLeft;
            this.clientRect.y = this.$el[0].offsetTop;
            this._addRangeBlock();
            this._addBehavior();
            this.updateSvgSizeInfo(this.clientRect.x, this.clientRect.y, w, h);
            this.editMode = Panel.EDIT_MODE.MOUSE;
        },
        updateSvgSizeInfo: function(x, y, w, h){
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
                    for (var i = 0, len = this.resizeListener.length; i < len; i++) {
                        this.resizeListener[i].call(this, {
                            x: x,
                            y: y,
                            w: w,
                            h: h,
                            oldX: this.clientRect.x,
                            oldY: this.clientRect.y,
                            oldW: this.clientRect.w,
                            oldH: this.clientRect.h
                        });
                    }
                    this.clientRect.x = x;
                    this.clientRect.y = y;
                    this.clientRect.w = w;
                    this.clientRect.h = h;
                }
            }
            return $.extend({}, this.clientRect);
        },
        _addBehavior: function(){
            var startPoint = {};
            var endPoint = {};
            this.$el.bind('mousedown', function(){

            }).bind('mousemove', function(){

            }).bind('mouseup', function(){

            });
        },
        destroy: function(){
            this.$el.remove();
            $('#panelContainers').off('mousemove', this.events['#panelContainers.mousemove']);
        },
        _addRangeBlock: function(){
            var pos = 'top,left,right,bottom,ne,nw,se,sw'.split(',');
            for (var i = 0, len = pos.length; i < len; i++) {
                this.$el.append('<div class="resize-bar ' + pos[i] + '" data-direction="' + pos[i] + '"></div>');
            }
            this.__addResizeEvent(this.$el);
        },
        // common event listener interface
        on: function(){

        },
        addResizeListener: function(fn){
            this.resizeListener.push(fn);
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
            $('body').bind('mouseup', function(e){
                drag = false;
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
                        h = rect.height + mouse.y - nowPosition.y
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
                self.updateSvgSizeInfo(offset.left, offset.top, w, h);
            }
        },
        setMode: function(mode){
            if (mode) {
                this.editMode = mode;
            }
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
                SVGTool.currentPanel=  new Panel();
                SVGTool.currentPanel.addResizeListener(SVGTool.updateSizeInfo);
                SVGTool.updateSizeInfo(SVGTool.currentPanel.updateSvgSizeInfo());
                SVGTool.operaStack = [];
                SVGTool.revertQueue = [];
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

                    break;
                case 'saveFile':
                    break;
                case 'saveImg':
                    break;
                case 'code':
                    this.currentPanel.setMode(Panel.EDIT_MODE.CIRCLE);
                    break;
                default:
                    console.warn('unregistered function');
                    break;
            }
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
                that.type = this.id || 'unknow';
                $container.find('.panel').attr('class', 'panel ' + that.type);
                SVGTool.currentPanel.setMode(this.type);
            });
            $menu.on('click', '.menu-item', function(){
                if ($(this).hasClass('disabled')) {
                    return false;
                }
                that.menuHandler(this.id);
            });
            $panel.on('mousedown mousemove', '.panel', function(e){
                var cx = e.clientX,
                    cy = e.clientY,
                    offset = $(this).offset();
                panelMouse.x = cx + (window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft) - offset.left;
                panelMouse.y = cy + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop) - offset.top;
            });
            // x,y,w,h control
            $('#svg_x, #svg_h, #svg_w, #svg_y').bind('change', function(){
                that.currentPanel && that.currentPanel.updateSvgSizeInfo(+$('#svg_x').val(), +$('#svg_y').val(), +$('#svg_w').val(), +$('#svg_h').val());
            });
        }
    };
    SVGTool.init();
    resizeEditor();
});