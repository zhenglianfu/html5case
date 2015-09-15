/**
 * Created by zhenglianfu on 2015/9/12.
 */

$('#flexBtn').bind('click', function(){
    var params = form2Obj($('#flexBox .form'));
    console.log(params);
});