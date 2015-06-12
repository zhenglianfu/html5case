/**
 * Created by Administrator on 2015/5/13.
 */
$(function(){
    var $wrap  = $('.svg-editor'),
        $panel = $wrap.find('.panel-wrap'),
        $menu  = $wrap.find('.menu-bar'),
        $tool  = $wrap.find('.tool-bar'),
        $bg    = $('.panel-bg');
    function resizeEditor(){
        var height = $wrap.height(),
            menuHeight = $wrap.find('.menu-bar').height();
        $tool.height(height - menuHeight - 2);
        $panel.height(height - menuHeight - 2);
    }
    var SVGTool = {
        type  : 'selector',
        index : 0,
        init : function(){

        },
        menuHandler : function(name){

        },
        bindEvent : function(){
            var that = this;
            $tool.on('click', 'li.tool-item', function(){
                if ($(this).hasClass('active')) {
                    return false;
                }
                $tool.find('.tool-item').removeClass('active');
                $(this).addClass('active');
                that.type = this.id || 'unknow';
            });
            $menu.on('click', '.menu-item', function(){
                that.menuHandler(this.id);
            });
        }
    };
    SVGTool.init();
    resizeEditor();
});