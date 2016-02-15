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
                    var args = [obj.type, '0 0','50% 50%','from(' + obj.start + ')', 'to(' + obj.end + ')'];
                    style += '-webkit-gradient(' + args.join(", ") + ')';
                    // new type
                    style += ';\nbackground-image: -webkit-linear-gradient(-45deg, ' + obj.start + ', ' + obj.end + ');'
                    break;
                case '-moz-':
                    style += '-moz-' + obj.type + '-gradient()';
                    break;
                case '-o-':
                    style += '-o-' + obj.type + '-gradient()';
                    break;
                case '-ms-':
                    break;
                default :
                    style += obj.type + '-gradient()';
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
            liHTML[i] = liTpl.replace('${icon}', browsers[i].icon).replace('${codeWidth}', /*global.codePreWidth*/ '-1').replace('${code}', browsers[i].prefix || '');
        }
        $ul.html(liHTML.join(''));
    }());

}(this));