/**
 * web分享组件，qq，微信，微博
 */
(function(){
	function getData(data){
		if (typeof data == 'function') {
			data = data();
		}
		if (data == null) {
			data = {};
		}
		return data;
	}
	function getEncodeURI(){
		var url = location.href;
		if (url.indexOf('#') > 0) {
			url = url.substring(0, url.indexOf('#'));
		}
		return encodeURIComponent(url);
	}
	function loadSDk(src, attr, callback){
		if (typeof attr == 'function') {
			callback = attr;
			attr = {};
		}
		var script = document.createElement("script");
		for (var i in attr) {
			script[i] = attr[i];
		}
		script.type = 'text/javascript';
		script.onload = callback;
		script.src = src;
		document.body.appendChild(script);
		
	}
	var isWechat = function(){
		return /micromessenger\/([\d\.]+)/i.test(navigator.userAgent);
	}();
	/* wechat component */
	function wxComponent(){
		var loaded = false;
		var sdkUrl = 'http://res.wx.qq.com/open/js/jweixin-1.0.0.js';
		var debug = location.href.indexOf('mami') < 0;
		var jsApiList = ['onMenuShareTimeline','onMenuShareAppMessage','onMenuShareQQ','onMenuShareQZone','onMenuShareWeibo','scanQRCode','chooseImage','previewImage','uploadImage','downloadImage','hideOptionMenu','showOptionMenu','hideMenuItems','showMenuItems','closeWindow','getNetworkType',
		                 'startRecord','stopRecord','onVoiceRecordEnd','playVoice','pauseVoice','stopVoice','uploadVoice','downloadVoice','translateVoice','closeWindow','scanQRCode'];
		var wxCog = null;
		function cogAjax(fn, fail){
			if (false) {
				wx.config(wxCog);
				fn && fn(wxCog);
			} else {
				Ajax.json({
					url : '/config/config/getWeiXinCog.json',
					data : {
						url : getEncodeURI()
					},
					success : function(data){
						var result = data.result;
						var weixinCog = {
								jsApiList : jsApiList,
								appId : result.appId,
								signature : result.signature,
								timestamp : result.timestamp,
								nonceStr : result.nonceStr,
								debug : debug
						}; 
						wxCog = weixinCog;
						wx.config(weixinCog);
						fn && fn(weixinCog);
					},
					fail : function(){
						fail && fail();
					}
				});
			}
		}
		loadSDk(sdkUrl, function(){
			loaded = true;
		});
		var wxApi = {
				loaded   : false,
				wxConfig : null,
				getWXCog : function(){
					return wxApi.wxConfig;
				},
				config : function(){
					var cog = {};
					for (var i = 0, len = jsApiList.length; i < len; i++) {
						cog[jsApiList[i]] = {};
					}
					return cog;
				}(),
				init : function(fn){
					if (loaded) {
						cogAjax(function(cog){
							wxApi.wxConfig = cog;
							cog.debug = wxApi.isDebug == undefined ? cog.debug : wxApi.isDebug;
							wx.ready(function(){
								for (var i in wxApi.config) {
									// 监听类函数
									if (i.indexOf('on') >= 0) {
										wx[i] && wx[i](getData(wxApi.config[i]));
									}
								}
								fn && fn();
							});
							wxApi.loaded = true;
						}, function(){
							console.error('jsSDK授权失败');
						});
					} else {
						setTimeout(function(){
							wxApi.init();
						}, 50);
					}
				},
				debug: function(open){
					wxApi.isDebug = open;
					return wxApi;
				},
				setConfig : function(token, data){
					if (typeof token == 'string') {
						wxApi.config[token] = $.extend(wxApi.config[token], data);
					} else if (typeof token == 'object') {
						data = token;
						for (var i in data) {
							wxApi.config[token] = $.extend(wxApi.config[i], data[i]);
						}
					}
					return wxApi;
				},
				share: function(message){
					message = message || '请点击右上角<br>将它发送给指定朋友<br>或分享到朋友圈'; 
					if (isWechat) {
						var $div = $('<div>').addClass('share-mask').appendTo(document.body);
						$div.html('<div class="arrow"><img src="/static/image/share/share-arrow.png"></div><div class="share-content">' + message + '</div>').on('click', function(){
							$div.remove();	
						});
					}
				}
		};
		return wxApi;
	}
	/* QQ component */
	function QQApi(){
		var sdkUrl = 'http://qzonestyle.gtimg.cn/qzone/openapi/qc_loader.js';
		var shareUrl = 'http://qzonestyle.gtimg.cn/qzone/app/qzlike/qzopensl.js#jsdate=20111201';
		var appId  = '101207622';
		var redictUri = '';
		var qqApi = {
				init : function(opts){
					opts = $.extend({
						showShare : true,
						showLogin : true,
						loginWrap : $('body'),
						shareWrap : $('body'),
						shareData : {
							url       : 'http://www.mamiguimi.com',
							showcount : 1,
							style     : '202',
							width     : 105,
							height    : 31,
							pics      : ''
						}
					}, opts);
					if (opts.showShare) {
						qqApi.initSharePlugin(opts);
					}
					if (opts.showLogin) {
						qqApi.initOpenApi(opts);
					}
				},
				initSharePlugin : function(opts){
					var fags = [];
					for (var i in opts.shareData) {
						fags.push(i + '=' + encodeURIComponent(opts.shareData[i]));
					}
					$(opts.shareWrap).append(['<a version="1.0" class="qzOpenerDiv" href="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?',fags.join('&'),'" target="_blank">分享</a>'].join(''));
					loadSDk(shareUrl, {
						charset : 'utf-8'
					});
				},
				initOpenApi : function(opts){
					loadSDk(sdkUrl, {
						'data-appid' : appId,
						'data-redirecturi' : redictUri
					}, function(){
						
					});
				},
		};
		return qqApi;
	}
	
	/* weibo component */
	function weiboApi(){
		var sdkUrl = '';
		var shareUrl = 'http://tjs.sjs.sinajs.cn/open/api/js/wb.js';
		var api = {
				init : function(opts){
					opts = $.extend({
						showShare: true,
						parent: $('body')
					}, opts);
					$('<html>').attr('xmlns:wb','http://open.weibo.com/wb');
					if (opts.showShare) {
						loadSDk(shareUrl);
						opts.parent.append('<wb:share-button addition="number" type="button"></wb:share-button>');
					}
				}
		};
		return api;
	}
	
	/* interface to global mami */
	var mami = window.mami || {};
	$.extend(mami, {
		wxShareApi : wxComponent(),
		QQApi : QQApi(),
		weiboApi : weiboApi()
	});
	window.mami = mami;
}());