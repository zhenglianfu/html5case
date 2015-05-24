/**
 * Created by Administrator on 2015/5/13.
 */
$(function(){
    var $wrap  = $('.svg-editor'),
        $panel = $wrap.find('.panel-wrap'),
        $tool  = $wrap.find('.tool-bar'),
        $bg    = $('.panel-bg');
    function resizeEditor(){
        var height = $wrap.height(),
            menuHeight = $wrap.find('.menu-bar').height();
        $tool.height(height - menuHeight - 2);
        $panel.height(height - menuHeight - 2);
    }
    resizeEditor();
});