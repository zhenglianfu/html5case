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
        this.events = {};
        this.init();
    };
    Panel.prototype = {
        init: function(){
            this.$svg.attr({
                height: this.$el.height() + 'px',
                width: this.$el.width() + 'px'
            });
            this._addRangeBlock();
            this._addBehavior();
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
        __addResizeEvent: function(){
            var drag = false;
            var direction = '';
            var mouse = {};
            var rect = {};
            var $el = this.$el;
            this.$el.find('.resize-bar').bind('mousedown', function(e){
                drag = true;
                direction = $(this).attr('data-direction');
                mouse = getMousePosition(e);
                rect.height = $el.height();
                rect.width = $el.width();
                rect.left = parseFloat($el.css('left'));
                rect.top = parseFloat($el.css('top'));
            });
            $('#panelContainers').off('mousemove').bind('mousemove', handlerMove);
            $('body').bind('mouseup', function(e){
                drag = false;
            });
            this.events['#panelContainers.mousemove'] = handlerMove;
            var $svg = this.$svg;
            // resize height width left top
            function handlerMove(e){
                if (drag == false) {
                    return;
                }
                e.preventDefault();
                var nowPosition = getMousePosition(e);
                var h = rect.height;
                var w = rect.width;
                switch (direction){
                    case "top":
                        var h = rect.height + mouse.y - nowPosition.y;
                        $el.height(h);
                        $el.css('top', rect.top + nowPosition.y - mouse.y + 'px');
                        break;
                    case "bottom":
                        var h = rect.height + (nowPosition.y - mouse.y);
                        $el.height(h);
                        break;
                    case "left":
                        w = rect.width + (mouse.x - nowPosition.x);
                        $el.width(w);
                        $el.css('left', rect.left + (nowPosition.x - mouse.x));
                        break;
                    case "right":
                        w = rect.width + (nowPosition.x - mouse.x);
                        $el.width(w);
                        break;
                    case "nw":
                        h = rect.height + mouse.y - nowPosition.y;
                        $el.height(h);
                        $el.css('top', rect.top + nowPosition.y - mouse.y + 'px');
                        w = rect.width + (mouse.x - nowPosition.x);
                        $el.width(w);
                        $el.css('left', rect.left + (nowPosition.x - mouse.x));
                        break;
                    case "ne":
                        h = rect.height + mouse.y - nowPosition.y
                        $el.height(h);
                        $el.css('top', rect.top + nowPosition.y - mouse.y + 'px');
                        w = rect.width + (nowPosition.x - mouse.x);
                        $el.width(w);
                        break;
                    case "se":
                        h = rect.height + (nowPosition.y - mouse.y);
                        $el.height(h);
                        w = rect.width + (nowPosition.x - mouse.x);
                        $el.width(w);
                        break;
                    case "sw":
                        h = rect.height + (nowPosition.y - mouse.y);
                        $el.height(h);
                        w = rect.width + (mouse.x - nowPosition.x);
                        $el.width(w);
                        $el.css('left', rect.left + (nowPosition.x - mouse.x));
                        break;
                }
                $svg.attr('height', h);
                $svg.attr('width', w);
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
        };
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
        type  : 'selector',
        index : 0,
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
                var panel=  new Panel();
            }
        },
        menuHandler : function(name){
            switch (name) {
                case "add":
                    this.addPanel();
                    break;
                case "fullScreen":
                    fullScreen($editor[0]);
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
            });
            $menu.on('click', '.menu-item', function(){
                that.menuHandler(this.id);
            });
            $panel.on('mousedown mousemove', '.panel', function(e){
                var cx = e.clientX,
                    cy = e.clientY,
                    offset = $(this).offset();
                panelMouse.x = cx + (window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft) - offset.left;
                panelMouse.y = cy + (window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop) - offset.top;
            });
        }
    };
    SVGTool.init();
    resizeEditor();
});