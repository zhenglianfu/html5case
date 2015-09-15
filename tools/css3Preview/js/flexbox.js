/**
 * Created by zhenglianfu on 2015/9/12.
 */

// set random color
function randomColor(){
    var r = Math.random() * 255 | 0,
        g = Math.random() * 255 | 0,
        b = Math.random() * 255 | 0;
    console.log(r,g,b);
    return "rgb(" + r + "," + g + "," + b + ")";
}

$('#flexBtn').bind('click', function(){
    var params = form2Obj($('#flexBox .form'));
    console.log(params);
});

$('.flex-box').children().each(function(){
    $(this).css({
        'background': randomColor()
    });
});