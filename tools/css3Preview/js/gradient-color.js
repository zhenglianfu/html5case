/**
 * Created by Administrator on 2015/7/23.
 */

(function(global){
    var browsers = global.browsers;
    var $content = $('#gradient');
    var $ul = $content.find('.code-list');
    var $target = $content.find('.target-ele');
    var $submit = $content.find('.submit');
    // bind change value event
    var listener = function(){
        $target.attr('style', generateCode());
    };
    $content.on('change', 'input, select', listener);
    $submit.bind('click', listener);
    function generateCode(){
        var csses = [];
        var obj = global.form2Obj($content);
        for (var i = 0; i < browsers.length; i++) {
            var style = 'background-image: ';
            switch (browsers[i].prefix){
                case '-webkit-':
                    var args = [obj.type, '0 0','50% 50%','from(' + obj.start + ')', 'to(' + obj.end + ')']
                    style += '-webkit-gradient(' + args.join(", ") + ')';
                    break;
                case '-moz-':
                    break;
                case '-o-':
                    break;
                case '-ms-':
                    break;
                default :
            }
            csses.push(style);
            $ul.find('li').eq(i).find('.code').text(style);
        }
        return csses.join(';');
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