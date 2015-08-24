/**
 * Created by Administrator on 2015/8/24.
 */
(function(){
    var key = '7d381f6b8c4189225ad53aa9167693d9';
    // choose a pic
    $('#imgIpt').bind('change', function(){
        readImgFile(this.files[0], function(dataUrl){
            $('#preImg').attr('src', dataUrl);
            faceVerify(dataUrl);
        });
    });
    function faceVerify(dataUrl){
        // remove prefix data:img/jpeg;base64,
        dataUrl = dataUrl.substr(dataUrl.indexOf(',') + 1);
        $.ajax({
            url: '/node/baidu/faceApi',
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            data : JSON.stringify({
                "params": dataUrl,
                "api": "faceRecognition"
                }),
            success: function(data){

            },
            error: function(){

            }
        });
    }
    function readImgFile(file, fn){
        var f = new FileReader;
        f.onload = function(){
            fn && fn(f.result);
        };
        f.readAsDataURL(file);
    }
}());