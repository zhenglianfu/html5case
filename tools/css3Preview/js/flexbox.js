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
        initFlexBox(form2Obj($('.form')));
    });

    $('#flexAddBtn').bind('click', function(){
        addFlexElement(form2Obj($('.form')))
    });

    $('.flex-box').children().each(function(){
        var color = randomColor();
        $(this).css({
            'background': color,
            'border-color': color
        });
    });

    function initFlexBox(opts){
        var direction = opts.direction,
            wrap = opts.wrap,
            $flexBox = $('.flex-box').html('').css({
                'flex-direction': direction,
                'flex-wrap': wrap
            }).addClass('shine');
        setTimeout(function(){
            $flexBox.removeClass('shine');
        }, 1000);
    }

    function addFlexElement(opts){
        var subWidth = opts.subWidth || '0';
        var $div = $('<div>').css({
            "order": opts.order || 0,
            "background": randomColor(),
            "flex": [(opts.subExtend || 1), opts.subShrink || 1, subWidth.indexOf('%') == -1 ? window.parseInt(subWidth) + 'px' : subWidth].join(' ')
        }).html('<span>' + opts.order + '</span>');
        $('.flex-box').append($div);
        $('.subForm input').val('');
    }
}());


