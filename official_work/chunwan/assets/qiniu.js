(function(){
	var mami = window.mami || {};
	var Qiniu = {};
	Qiniu.testDomain = 'http://7vzoz8.com2.z0.glb.qiniucdn.com/';
	Qiniu.domain = 'http://7vzoz8.com2.z0.glb.qiniucdn.com/';
	Qiniu.imgArgs = Qiniu.search = '?imageView2/2/w/640/format/jpg/q/75';
	Qiniu.upload64URL = 'http://up.qiniu.com/putb64/';
	Qiniu.uploadURL = 'http://upload.qiniu.com/';
	Qiniu.token = '';
	Qiniu.uploadFile = function(file, opts, fn){
		if (typeof opts === 'function') {
			fn = opts;
			opts  = {};
		}
		Qiniu.getToken(function(token){
			var form = new FormData;
			opts.key ? form.append('key', opts.key) : '';
			form.append('file', file);
			form.append('token', token);
			var xhr = new XMLHttpRequest;
			xhr.open('post', Qiniu.uploadURL);
			xhr.onreadystatechange = function(){
				if (xhr.readyState == 4) {
					if (xhr.status == 200) {
						fn && fn.call(null, JSON.parse(xhr.responseText));
					} else {
						fn && fn({
							error: 'occurred error when upload',
							status: xhr.status
						}, null);
					}
				}
			};
			xhr.send(form);
		});
	};
	Qiniu.uploadImg = function(img, fn){
		var reader = new FileReader(img);
		reader.onload = function(result){
			var base64 = result.substr(result.indexOf(',') + 1);
			Qiniu.upload64({
				file: img,
				size: img.size,
				base64: base64,
				callback: function(res){
					fn && fn(res);
				}
			});
		};
		reader.readAsDataURL(img);
	};
	Qiniu.upload64 = function(obj){
		if (Qiniu.token == '') {
			return Qiniu.getToken(function(){
				Qiniu.upload64(obj);
			});
		}
		var xhr = new XMLHttpRequest;
		var postUrl = Qiniu.upload64URL + (obj.size || -1);
		if (obj.key) {
			postUrl += '/key/' + mami.crypto.base64.encode(obj.key);
		}
		xhr.open('post', postUrl);
		xhr.onreadystatechange = function(){
			if (xhr.readyState == 4) {
				if (xhr.status == 200) {
					obj.callback && obj.callback(JSON.parse(xhr.responseText));
				} else {
					mami.tip(xhr.responseText);
				}
			}
		};
		xhr.setRequestHeader('Content-Type', obj.mimeType || 'application/octet-stream');
        xhr.setRequestHeader("Authorization", "UpToken " + Qiniu.token);
		xhr.send(obj.base64);
	};
	Qiniu.getToken = function(fn){
		if (Qiniu.token && fn !== false) {
			return fn && fn(Qiniu.token);
		}
		mami.Ajax.json({
			url : '/config/config/getQiniuTokenPC.json',
			success: function(data){
				Qiniu.token = data.result;
				fn && fn(Qiniu.token);
			}
		});
	};
	Qiniu.imageView2 = function(obj){
		var args = [];
		obj = $.extend({
			mode: 2
		}, obj);
		args[0] = obj.mode;
		$.each('w|h|format|interlace|q|ignore-error'.split('|'), function(i, v){
			if (obj[v]) {
				args.push(v + '/' + obj[v]);
			}
		});
		return '?imageView2/' + args.join('/');
	};
	// flush token every 10mins
	(function flushToken(){
		Qiniu.getToken(false);
		setTimeout(flushToken, 10000 * 60);
	}());
	mami.Qiniu = Qiniu;
	return mami;
}());