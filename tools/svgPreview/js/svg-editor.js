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
        this.$svg = $('<svg xmlns="http://www.w3.org/2000/svg">').appendTo(this.$el);
        this.init();
    };
    Panel.prototype = {
        init: function(){
            this.$svg.attr({
                height: this.$el.height() + 'px',
                width: this.$el.width() + 'px'
            });
            this._addRangeBlock();
        },
        _addRangeBlock: function(){
            var pos = 'top,left,right,bottom,ne,nw,se,sw'.split(',');
            for (var i = 0, len = pos.length; i < len; i++) {
                this.$el.append('<div class="resize-bar ' + pos[i] + '" data-direction="' + pos[i] + '"></div>');
            }
            var $el = this.$el;
            var drag = false;
            var mouse = {};
            var rect = {};
            this.$el.find('.resize-bar').bind('mousedown', function(e){
                drag = true;
                mouse = getMousePosition(e);
                rect.height = $el.height();
                rect.width = $el.width();
            }).bind('mousemove', function(e){
                if (drag == false) {
                    return;
                }
                e.preventDefault();
                handlerMove(getMousePosition(e), $(this).attr('data-direction'));
            }).bind('mouseup', function(e){
                drag = false;
            });
            function handlerMove(nowPosition, direction){
                switch (direction){
                    case "top":
                        
                        $el.height(rect.height - (nowPosition.y - mouse.y));
                        $el.css('top', $el[0].offsetTop + e.clientY - mouse.clientY);
                }
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
            y: (window.pageYOffset || window.document.body.scrollTop) + e.clientY
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