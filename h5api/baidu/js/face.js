/**
 * Created by Administrator on 2015/8/24.
 */
(function(){
    var username = '';
    var key = '7d381f6b8c4189225ad53aa9167693d9';
    var dataUrl = '';
    // choose a pic
    $('#imgIpt').bind('change', function(){
        readImgFile(this.files[0], function(imgData){
            $('#preImg').attr('src', imgData);
            dataUrl = imgData;
        });
    });

    $('#register').bind('click', function(){
        if (!dataUrl) {
            alert('选择图片');
            return false;
        }
        faceRegister(dataUrl);
    });
    $('#verify').bind('click', function(){
        userFaceVerify(dataUrl);
    });
    $('#recognition').bind('click', function(){
        if (!dataUrl) {
            alert('选择图片');
            return false;
        }
       faceVerify(dataUrl);
    });
    function faceRegister(dataUrl){
        dataUrl = dataUrl.substr(dataUrl.indexOf(',') + 1);
        $.ajax({
            url: '/node/baidu/faceApi',
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            data : JSON.stringify({
                "params": dataUrl,
                "api": "faceRegister"
            }),
            success: function(data){
                username = data.data.username;
                console.log(data);
            }
        })
    }
    function faceVerify(dataUrl){
        // remove prefix data:img/jpeg;base64,
        dataUrl = dataUrl.substr(dataUrl.indexOf(',') + 1);
        $.ajax({
            url: '/node/baidu/faceApi',
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            data : JSON.stringify({
                "params": {
                    data : dataUrl
                },
                "api": "faceRecognition"
                }),
            success: function(data){
                console.log(data);
            },
            error: function(){

            }
        });
    }
    function userFaceVerify(dataUrl){
        // remove prefix data:img/jpeg;base64,
        dataUrl = dataUrl.substr(dataUrl.indexOf(',') + 1);
        $.ajax({
            url: '/node/baidu/faceApi',
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            data : JSON.stringify({
                "params": {
                    data : dataUrl,
                    username: username
                },
                "api": "faceVerify"
            }),
            success: function(data){
                console.log(data);
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
    // compare
    var $curBox = null;
    $('.img-cmp-box').bind('click', function(){
        $curBox = $(this);
        $('#cmpFile').trigger('click');
    });
    $('#cmpFile').bind('change', function(){
        readImgFile(this.files[0], function(url){
           $curBox.html('<img class="whole" src="' + url + '">');
        });
        this.value = '';
    });
    $('#compareBtn').bind('click', function(){
        var imgs = $('.img-cmp-box img');
        if (imgs.length < 2) {
            alert('选择两张图片进行比较');
            return false;
        }
        faceCompare(imgs);
    });
    function faceCompare(imgs){
        var sampleName = "fanbibi",
            userName = "ds",
            sampleImg = imgs.eq(0).attr('src'),
            userImg = imgs.eq(1).attr('src');
        sampleImg = sampleImg.substr(sampleImg.indexOf(",") + 1);
        userImg = userImg.substr(userImg.indexOf(",") + 1);
        $('body').addClass('loading');
        $.ajax({
            url: '/node/baidu/faceApi',
            type: 'post',
            dataType: 'json',
            contentType: 'application/json',
            data : JSON.stringify({
                "params": {
                    usernames: {
                        ds: userName,
                        fanbibi: sampleName
                    },
                    images: {
                        ds: userImg,
                        fanbibi: sampleImg
                    },
                    cates: {
                        ds: $('#picType').val(),
                        fanbibi: $('#picType').val()
                    }
                },
                "api": "faceCompare"
            }),
            success: function(data){
                $('body').removeClass('loading');
                var results = data.data.result._ret.reslist;
                if ($.isEmptyObject(results)) {
                    $('#degree').text('瞎了我的狗眼竟然无法识别');
                    return;
                }
                for (var i in results) {
                    $('#degree').text("相似度" + (100 - results[i]) + '%');
                    break;
                }

            },
            error: function(){
                $('body').removeClass('loading');
                alert('小度不给力，再点一次');
            },
            always: function(){
                $('body').removeClass('loading');
            }
        });
    }
}());