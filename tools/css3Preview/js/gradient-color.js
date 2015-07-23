/**
 * Created by Administrator on 2015/7/23.
 */

(function(global){
    var browsers = global.browsers;
    var $content = $('#gradient');
    var $ul = $content.find('.code-list');
    // bind change value event
    $content.on('change', 'input, select', function(){
        generateCode();
    });
    function generateCode(){

    }

    // fill browser li
    (function(){
        var liTpl = $('#cssCodeline').html();
        var liHTML = [];
        for (var i = 0; i < browsers.length; i ++) {
            liHTML[i] = liTpl.replace('${icon}', browsers[i].icon).replace('${codeWidth}', global.codePreWidth).replace('${code}', browsers[i].prefix || '');
        }
        $ul.html(liHTML.join(''));
    }());

}(this));