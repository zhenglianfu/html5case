/**
 * Created by zhenglianfu on 2015/9/12.
 */

(function(){
    var $ = function(str){
        return jQuery(str, '#flexBox')
    };
    // set random color
    function randomColor(){
        var r = Math.random() * 255 | 0,
            g = Math.random() * 255 | 0,
            b = Math.random() * 255 | 0;
        console.log(r,g,b);
        return "rgb(" + r + "," + g + "," + b + ")";
    }

    $('#flexBtn').bind('click', function(){
        var params = form2Obj($('.form'));
        console.log(params);
        fillFlexBox(params);
    });

    $('.flex-box').children().each(function(){
        var color = randomColor();
        $(this).css({
            'background': color,
            'border-color': color
        });
    });

    function fillFlexBox(opts){
        var direction = opts.direction || 'row',
            row_num = window.parseInt(opts.row) || 1,
            col_num = window.parseInt(opts.column) || 1,
            shrink = opts.shrink == "" ? 1 : (parseInt(opts.shrink) || 0),
            width = opts.width,
            $flexBox = $('.flex-box').html('').css({
                'flex-direction': direction
            });
        for (var i = 0; i < row_num * col_num; i++) {
            var $div = $('<div>').css({
                "background": randomColor(),
                "flex-shrink": shrink,
                width: width
            });
            $flexBox.append($div);
        }

    }
}());


