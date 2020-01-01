/**
./js * Created by dingdang on 2015/4/1.
 * depend on jquery or zepto
 */
/* ajax util */
(function($) {
	var foo = function() {},
		browserPrefix = ['webkit', 'moz', 'ms'];
		// sys url
	window.requestAnimationFrame = window.requestAnimationFrame || function(fn){
		return setTimeout(function(){
			fn && fn();
		}, 50 / 3);
	};	
	// url中提取参数
	function location2obj(url) {
		url = url || window.location.href;
		if (url.indexOf('?') == -1) {
			return {};
		}
		url = url.substr(url.indexOf('?') + 1);
		url = url.substring(0, url.lastIndexOf('#') == -1 ? undefined : url.lastIndexOf('#'));
		var params = url.split('&');
		var obj = {};
		for ( var i = 0, len = params.length; i < len; i++) {
			var ps = params[i].split('=');
			obj[ps[0]] = decodeURI(ps.slice(1).join('='));
		}
		return obj;
	};
	// 对象解析成search name=li&ds=ds
	function obj2search(obj){
		var strs = [],
			len = 0;
		for (var i in obj) {
			strs[len] = i + '=' + (obj[i] == null ? '' : obj[i]); 
			len ++;
		}
		return strs.join('&');
	}
	// url中提取imageId
	var localParams = function(){
		var imagename = "",
			imageId = "",
			url = window.location.href,
			query = url.split("?")[1],
			firstKey = '';
		if (query) {
			firstKey = query.split("&")[0].split("=")[0];
		}
		if(firstKey == "username"){
			var imageName=url.split("?")[1].split("&")[1].split("=")[1];
			imagename=decodeURI(imageName);
		}else if(firstKey=="imageId"){
			imageId=url.split("?")[1].split("&")[0].split("=")[1];
		}
		return {
				imagename : imagename,
				imageId : imageId
		};
	}();
	// browser test, mobile first
	var browser = function(agent){
		var browser = {},
			browserRegs = [
		                   {reg: /mobile/i, match : function(m){
		                	    return {isMobile: true};
		                   }},
		                   {reg: /android ([\d\.]+);/i, match : function(m){
		                	   return {
		                		   isAndroid: true,
		                		   osVersion: m[1]
		                	   };
		                   }},
		                   {reg: /ios\s+([\d\.]+)/i, match: function(m){
		                	   return {
		                		   isIOS : true,
		                		   osVersion: m[1]
		                	   };
		                   }},
		                   {reg: /iphone os ([\d_]+)/i, match : function(m){
		                	   return {
		                		   isIphone: true,
		                		   isIPhone: true,
		                		   isIOS   : true,
		                		   osVersion: m[1].replace(/_/g, '.')
		                	   };
		                   }},
		                   {reg : /ipad; cpu os ([\d_]+)/i, match : function(m){
		                	   return {
		                		   isIpad : true,
		                		   isIPad : true,
		                		   isIOS  : true,
		                		   osVersion : m[1].replace(/_/g, '.')
		                	   };
		                   }},
		                   {reg: /msie (\d+)/i, match : function(m){
		                	   	return {
		                	   		isIE: true,
		                	   		version: m[1]
		                	   	};
		                   }},
		                   {reg: /chrome\/([\d\.]+)/i, match : function(m){
		                	   	return {
		                	   		isChrome: true,
		                	   		version: m[1]
		                	   	};
		                   }},
		                   {reg: /firefox\/([\d\.]+)/i, match : function(m){
		                	   	return {
		                	   		isFirefox: true,
		                	   		version: m[1]
		                	   	};
		                   }},
		                   {reg: /micromessenger\/([\d\.]+)/i, match : function(m){
		                	   	return {
		                	   		isWechat: true,
		                	   		version: m[1]
		                	   	};
		                   }},
		                   {reg: /mqqbrowser\/([\d\.]+)/i, match : function(m){
		                	   	return {
		                	   		isMQQ: true,
		                	   		version: m[1]
		                	   	};
		                   }},
		                   {reg: /weibo/i, match: function(m){
		                	   return {
		                		   isWeibo: true,
		                		   version: m[1]
		                	   };
		                   }},
		                   {reg: /mami\/([\d\.]+)/i, match: function(m){
		                	   return {
		                		   isMamiApp: true
		                	   };
		                   }},
		                   {reg : /mami\/([\d.]+)/i, match : function(m){
		                		   return {
		                			   isMamiApp  : true,
		                			   appVersion : m[1]
		                		   };
		                	   }
		                   }
		                   
		];
		for (var i = 0, len = browserRegs.length; i < len; i++) {
			var reg = browserRegs[i],
				m = agent.match(reg.reg);
			m && $.extend(browser, reg.match(m));
		}
		return browser;
	}(navigator.userAgent);
	/** cookie operation **/
	var cookie = function(){
		return {
			setCookie : function(key, value, exprise){
				document.cookie = key + '=' + escape(value) + (exprise ? ';expires=' + new Date((new Date().getTime() + exprise)).toGMTString() : ''); 
			},
			getCookie: function(name){
				var arr,
					reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
				if(arr = document.cookie.match(reg)) {
					 return unescape(arr[2]); 
				} else {
			    	return ''; 
			    } 
			}
		};
	}();
	// AJAX setting
	var defaults = {
		imgDetail : {
			url : '/image/image/getUserImageDetailPC.json'
		},
		imageRecommend : {
			url : '/image/image/getImageRecommendPC.json'
		}
	};
	window.Root = '';
	var Ajax = {
		postJSON : function(opts) {
			return Ajax.json($.extend(opts, {
				type : 'post'
			}));
		},
		json : function(opts) {
			var userId = cookie.getCookie('fmbg');
			var token = cookie.getCookie('hkju');
			var p = $.extend({
				beforeSend: function(xhr){
					opts.beforeSend && opts.beforeSend(xhr); 
					token && xhr.setRequestHeader('token', token);
					userId && xhr.setRequestHeader('userId', userId);
				}
			}, opts, {
				contentType: 'application/json',
				dataType : 'json',
				type: 'post'
			});
			p.url = p.url.indexOf('http://') == 0 ? p.url : window.Root + p.url;
			p.data = JSON.stringify(opts.data || {});
			p.success = Ajax.success(p.success, p.fail || p.error, p);
			p.err = Ajax.error;
			opts.mask !== false && $('body').addClass('loading');
			return $.ajax(p);
		}
	};
	Ajax.success = function(fn, err, opts) {
		fn = fn || foo;
		err = err || function(d){
			mami.tip(d);
		};
		return function(data) {
			$('body').removeClass('loading');
			if (typeof data === 'string') {
				try{
					data = fn(JSON.parse(data));
				} catch(e){}
			}
			if (data.generalResult && data.generalResult.returnCode == '0') {
				fn(data.generalResult);
			} else {
				err(data.generalResult);
			}
		};
	};
	Ajax.err = function(data) {
		$('body').removeClass('loading');
	};
	// interface
	window.Ajax = Ajax;
	var nodeAjax = function(opts){
		opts = $.extend({
			contentType: 'application/json',
			type: 'post',
			dataType: 'json',
			data: {},
			success: foo,
			fail: foo,
			error: foo,
			modal: true
		}, opts);
		opts.loadingKey = 'node_loading_' + new Date().getTime();
		opts.success = nodeAjaxProxy(opts.success, opts.fail, opts);
		opts.error = nodeAjaxProxy(opts.error, opts);
		opts.data = typeof opts.data == 'object' ? JSON.stringify(opts.data) : opts.data;
		opts.modal ? $('body').addClass(opts.loadingKey + ' loading') : undefined;
		return $.ajax(opts);
	};
	var nodeAjaxProxy = function(){
		switch(arguments.length){
		case 3:
			var succ = arguments[0],
				fail = arguments[1],
				opts= arguments[2];
			return function(res){
				if (opts.modal){
					$('body').removeClass(opts.loadingKey);
					if ($('body')[0].className.indexOf('')) {}
				}
				if (res.success) {
					succ(res.data);
				} else {
					fail(res.err) !== false && res.err.message && mami.tip(res.err.message);
				}
			};
		case 2:
			var opts = arguments[1];
			return function(xhr){
				if (opts.modal){
					$('body').removeClass(opts.loadingKey);
					if ($('body')[0].className.indexOf('')) {}
				}
				mami.tip(xhr.responseText);
			};
		}
	};
	// date format function
	Date.format = function(date, pattern) {
		pattern = pattern || 'yyyy-MM-dd hh:mm';
		if (typeof date === 'unmber') {
			date = new Date(date);
		} else if (typeof date === 'string') {
			date = Date.parse(date);
		}
		pattern = pattern.replace(/yyyy/g, date.getFullYear());
		pattern = pattern.replace(/MM/g, fixDateNum(date.getMonth() + 1));
		pattern = pattern.replace(/dd/g, fixDateNum(date.getDate()));
		pattern = pattern.replace(/hh/g, fixDateNum(date.getHours()));
		pattern = pattern.replace(/mm/g, fixDateNum(date.getMinutes()));
		pattern = pattern.replace(/ss/g, fixDateNum(date.getSeconds()));
		return pattern;
	};
	function fixDateNum(num) {
		return num > 9 ? num : '0' + num;
	}
	/** if image is not fund, set default image url **/
	window.errImg = function(img) {
		img.src = "/static/image/share/def_head.png";
	};
	/** useful Class * */
	var DetailBox = function(el, opts) {
		this.$el = $(el);
		this.opts = $.extend({
			showTopic : true
		}, opts);
		this.init();
	};
	DetailBox.prototype = {
		init : function() {
			this.$topbar = $('<div>').addClass('top-bar').appendTo(this.$el);
			this.$picBlock = $('<div>').addClass('pic-display-wrap').appendTo(
					this.$el);
			;
			this.$tagDiv = $('<div>').addClass('tag-wrap').appendTo(this.$el);
			;
			this.$topicBox = $('<div>').addClass('topic-box-wrap').appendTo(
					this.$el);
			;
			this.getDetail(this.opts.imageId);
		},
		getDetail : function(imageId) {
			var that = this;
			Ajax.postJSON({
				url : defaults.imgDetail.url,
				data : {
					imageId : localParams.imageId,
					imagename : localParams.imagename || ''
				},
				success : function(data) {
					that.generateHTML(data);
				},
				error : function(data) {
					that.generateErrHTML(data);
				}
			});
		},
		generateTopbar : function(result) {
			var topbar = '<a href="" class="link-back"></a>';
			topbar += '<div class="user-info"><span class="user-info-pic"><img src="'
					+ result.advatarUrl
					+ '" alt="" onerror="errImg(this)"></span><span class="user-info-detail">';
			if (result.userMotherDays != null && result.userMotherDays != "") {
				topbar += '<span class="user-name">' + (result.nickname || '')
						+ '</span>'
						+ '<span class="user-history"><b class="orange">'
						+ (result.userMotherDays || '') + '</b></span>';
			} else {
				topbar += '<span class="user-name usernmae-center">'
						+ (result.nickname || '') + '</span>';
				topbar += '<span ></span>';
			}
			topbar += '</span></div>';
			topbar += '<a class="share-link"></a>';
			this.$topbar.html(topbar);
			return this.$topbar;
		},
		generatePicDisplay : function(data, url) {
			var $block = this.$picBlock;
			if ($.isArray(data)) {
				var width = document.documentElement.clientWidth,
					smallWidth = 50,
					len = data.length,
					html = '<ul class="pic-display-list" style="width:' + (width * len) + 'px">';
				for (var i = 0; i < len; i++) {
					var item = data[i];
					html += '<li style="width:' + width + 'px"><div class="pic-display"><img src="' + (url.replace('{img}',item.image)) + '"></div></li>';
				}
				html += '</ul>';
				$block.html(html).find('.pic-display img').bind('load', function(){
					// resize position
					var h = $block.find('.pic-display-list').height();
					$block.find('.pic-display').each(function(){
						if ($(this).height() < h) {
							$(this).css('margin-top', (h - $(this).height()) / 2);
						}
					});
				});
				// add ctrls
				var $ctrlWrap = $('<div>').addClass('margin-horizontal').html('<div class="pic-display-ctrl-wrap"></div>');
				$block.after($ctrlWrap);
				html = '<ul class="pic-display-ctrl-icons" style="width:' + len * smallWidth + 'px">';
				for (i = 0; i < len; i++) {
					html += '<li style="width:' + smallWidth + 'px"><div class="display-pic-small"><img src="' + url.replace('{img}', data[i].image) + '"></div></li>';
				}
				html += '</ul>';
				html += '<div class="current-ctrl-icon-frame"></div>';
				$ctrlWrap.children().html(html);
				$ctrlWrap.find('.display-pic-small img').bind('load', function(){
					var h = $ctrlWrap.height();
					$ctrlWrap.find('.display-pic-small').each(function(){
						$(this).css('margin-top', Math.max((h - $(this).height()) / 2, 0));
					});
				});
				this.initPicSlider($block, $ctrlWrap.children(), data);
			} else {
				$block.html('<div class="pic-display"><img src="' + data.domain
						+ data.image + data.newImageSize + '" alt=""></div>');
			}
		},
		initPicSlider : function($block, $ctrl, list){
			var slideWidth = document.documentElement.clientWidth,
				currentIndex = 0,
				ctrlLeft = 0,
				ctrlWidth = $ctrl.find('li').width(),
				len = list.length,
				isRunning = false,
				scrollLeft = 0;
			function slide(start, alter, curTime, duration){
				curTime = curTime || 0;
				duration = duration || 500;
				if (curTime <= duration) {
					setTimeout(function(){
						$block[0].scrollLeft = Tween.linear(start, alter, curTime, duration);
						curTime += 50;
						slide(start, alter, curTime, duration);
					}, 20);
				}
			}
			function setScrollLeft(left){
				this[0].scrollLeft = left;
			}
			function setIndex(){
				isRunning = true;
				ctrlLeft = ctrlWidth * currentIndex;
				$ctrl.find('.current-ctrl-icon-frame').css('left', ctrlLeft);
			}
			function resetRuning(){
				scrollLeft = $block[0].scrollLeft;
				isRunning = false;
			}
			function slideHorizontal(el, start, alter){
				Animate(el, {
					start: start,
					alter: alter,
					duration : 300,
					running : setScrollLeft,
					before : setIndex,
					end    : resetRuning 
				});
			}
			Wipe($block[0], {
				left : function(){
					if (isRunning) {
						return;
					}
					currentIndex ++;
					if (currentIndex >= len) {
						currentIndex = len - 1;
					} else {
						slideHorizontal($block, scrollLeft, slideWidth);
					}
				},
				right : function(){
					if (isRunning) {
						return;
					}
					currentIndex --;
					if (currentIndex < 0) {
						currentIndex = 0;
					} else {
						slideHorizontal($block, scrollLeft, -slideWidth);
					}
				},
				down: function(e, delta){
					var $body = $('body');
					Animate($body, {
						start : $body.scrollTop(),
						alter : -Math.abs(delta),
						duration : 300,
						running : function(){
							$body.scrollTop($body.scrollTop() - 10);
						}
					});
				},
				up : function(e, delta){
					var $body = $('body');
					Animate($body, {
						start : $body.scrollTop(),
						alter : Math.abs(delta),
						duration : 300,
						running : function(){
							$body.scrollTop($body.scrollTop() + 10);
						}
					});
				}
			});
			$ctrl.find('li').click(function(){
				if (isRunning) {
					return;
				}
				var nextIndex = $(this).index();
				if (currentIndex != nextIndex) {
					var delta = slideWidth * (nextIndex - currentIndex);
					currentIndex = nextIndex;
					slideHorizontal($block, scrollLeft, delta);
				}
			});
		},
		generateTag : function(data) {
			var tags = data.imageTagList;
			var html = '';
			for ( var i = 0, len = tags.length; i < len; i++) {
				html += '<a class="tag orange" href="javascript:/*fzl*/" data-id="'
						+ tags[i].tagDetailId
						+ '">#'
						+ tags[i].tagName
						+ '#</a>';
			}
			html += data.comment || '';
			this.opts.showTimestamp && (html += '<div class="timestamp"><div class="stime">'
					+ Date.format((new Date(data.createTime) || ''))
					+ '</div></div>');
			this.$tagDiv.html(html);
		},
		generateHTML : function(data) {
			result = data.result;
			// topbar
			this.generateTopbar(result);
			// pic
			this.generatePicDisplay(result.webMultiUserImageList, result.domain + '{img}' + result.newImageSize);
			// tag
			this.generateTag(result);
			// message
			if (this.opts.showTopic) {
				this.topicBox = new TopicBox(this.$topicBox, result);
			}
		},
		generateErrHTML : function(data) {
			this.generateTopbar(data);
			this.$el.append('<div>' + data.message + '</div>');
		}
	};
	/** topic list * */
	var TopicBox = function(el, data) {
		this.$el = $(el);
		this.result = $.extend({}, data);
		this.init();
	};
	TopicBox.prototype = {
		init : function() {
			this.$box = $('<div>').addClass('topic-box').appendTo(this.$el);
			this.$boxSummary = $('<div>').addClass('topic-summary').appendTo(
					this.$box);
			this.$topicList = $('<div id="commentlist">')
					.addClass('topic-list').appendTo(this.$box);
			// this.$ipt =
			// $('<div>').addClass('reply-ipt').appendTo(this.$el).html('<input
			// class="ipt" type="text">');
			this.updateSummary();
			this.updateMessage();
		},
		bindEvent : function() {
			// invoke after generate HTML
		},
		updateSummary : function() {
			var list = this.result.imagePraiseList;
			var html = '<i class="toggle-arrow"></i>';
			html += '<ul class="topic-user-pic">';
			for ( var i = 0, len = list.length; i < len; i++) {
				if (i < 10) {
					html += '<li class="topic-user-pic-item" data-userLoginId="'
							+ list[i].userLoginId
							+ '"><img src="'
							+ list[i].advatarUrl
							+ '" alt="" onerror="errImg(this)"></li>';
				} else {
					break;
				}
			}
			html += '</ul>';
			html += '<span class="topic-num">' + list.length + '</span>';
			this.$boxSummary.html(html);
		},
		updateMessage : function() {
			var list = this.result.imageCommentListBytime, userLoginId = this.result.userLoginId, $div = this.$topicList, html = '<ul>';
			list = list.reverse();
			if (list.length != 0) {
				for ( var i = 0, len = list.length; i < len; i++) {
					var item = list[i];
					var side = 'left';
					var owner = userLoginId == item.userLoginId ? '<a href="javascript:/*fzl*/" class="owner">[蜜主]</a>'
							: '';
					if (item.type == 2) {
						item.content = '<b class="replay-prefix">回复 <b class="orange"> @'
								+ item.replyNickName
								+ '</b>: </b> '
								+ item.content;
					}
					html += '<li class="topic-list-item '
							+ side
							+ '-side"><div class="user-portrait-wrap"><span class="user-portrait"><img src="'
							+ item.advatarUrl
							+ '" onerror="errImg(this)"></span><span class="last-time">'
							+ this.caculatePassedTime(item.createTime)
							+ '</span></div>'
							+ '<div class="message-box-wrap"><div class="nick-name">'
							+ owner + item.nickName
							+ '</div><div class="msg-content">'
							+ '<span class="msg-content-text">' + (item.mediaType == 1 ? item.content : '<div class="replay-img-wrap"><img src="http://img01.mamiguimi.com/' + item.commentImage + item.commentImageSize + '"></div>')
							+ '</span></div></div></li>';
				}
			} else {
				$("#commentlist").removeClass('topic-list');
			}
			html += '</ul>';
			$div.html(html);
			// caculate height of each message
			$div.find('li').each(function(){
				var $divs = $(this).children(); 
				$(this).css({
					height:  Math.max($divs.eq(0).height(), $divs.eq(1).height())
				});
			});
		},
		addMessage : function() {

		},
		caculatePassedTime : function(time) {
			var cDate = new Date(time), current = new Date().getTime(), b = (current - time) / 1000 / 60;
			if (b < 1) {
				return '刚刚';
			} else if (b < 59) {
				return parseInt(b) + '分钟前';
			} else if (b < 60 * 24) {
				return '昨天 ' + Date.format(cDate, 'hh:mm');
			} else if (b < 60 * 24 * 360) {
				return Date.format(cDate, 'MM-dd hh:mm');
			} else {
				return Date.format(cDate, 'yyyy-MM-dd');
			}
		}
	};
	/** recommend list * */
	var Recommed = function(el) {
		this.$el = $(el);
		this.$wrap = $('<div>').addClass('recommend-wrap').html(
				'<h4>猜你喜欢</h4><div class="recommend-list-wrap"></div>')
				.appendTo(this.$el);
		var that = this;
		Ajax.postJSON({
			url : defaults.imageRecommend.url,
			data : {
				imageId : localParams.imageId,
				imagename : localParams.imagename || ''
			},
			success : function(data) {
				that.init(data);
			}
		});
	};
	Recommed.ITEM_WIDTH = 100;
	Recommed.prototype = {
		init : function(data) {
			this.updateList(data.result);
		},
		updateList : function(list) {
			var i = 0, len = list.length, $ul = $('<ul>').addClass(
					'recommend-list clear-fix').appendTo(
					this.$wrap.find('.recommend-list-wrap')), html = '';
			for (; i < len; i++) {
				html += '<li class="recommend-item"><div><img src="'
						+ list[i].domain + list[i].image + list[i].newImageSize
						+ '" alt=""></div></li>';
			}
			$ul.html(html);

			this.$ul = $ul;
			this.initSilder(len);
		},
		initSilder : function(len) {
			var wrapWidth = this.$wrap.width();
			Recommed.ITEM_WIDTH = wrapWidth / 3;
			this.$ul.css({
				width : len * Recommed.ITEM_WIDTH
			});
			this.$ul.find('li').width(Recommed.ITEM_WIDTH);
			this.$wrap.find('.recommend-list-wrap').height(Recommed.ITEM_WIDTH);
			this.perCount = Math.floor(wrapWidth / Recommed.ITEM_WIDTH);
			this.count = Math.round(len / this.perCount);
			this.currentIndex = 0;
			this.slideStart(1);
		},
		slideStart : function(index) {
			var that = this;
			setTimeout(
					function() {
						index = index % that.count;
						var left = 0 - (that.currentIndex * that.perCount * Recommed.ITEM_WIDTH);
						that
								.run(
										left,
										0 - (index * that.perCount * Recommed.ITEM_WIDTH));
						that.currentIndex = index;
						that.slideStart(index + 1);
					}, 5000);
		},
		run : function(from, to, duration, t) {
			var that = this;
			var b = to - from;
			var dura = duration || 1000;
			t = t || 0;
			if (t < dura) {
				t += 50;
				setTimeout(function() {
					that.$ul.css({
						left : from + (t / dura * b)
					});
					that.run(from, to, dura, t);
				}, 50);
			}
		}
	};
	// UI toolix
	// keep width and height at once 
	var docClientHeight = document.documentElement.clientHeight;
	var docClientWidth = document.documentElement.clientWidth;
	var TipBox = function TipBox(opts){
		if (!(this instanceof TipBox)) {
			return new TipBox(opts);
		}
		this.opts = $.extend({}, TipBox.defaults, opts);
		this.ident = new Date().getTime();
		this.init();
	};
	TipBox.defaults = {
			parent: document.body,
			type: 'tip',
			animation: 'fade',
			autoDel: true,
			showBtn: '',
			position: 'center',
			showTime: 2000,
			message : '提示',
			width: 'auto',
			height: 'auto',
			ok : foo,
			style: 'default'
	};
	TipBox.closeAll = function(){
		$('.tip-box').remove();
	};
	TipBox.prototype = {
			init: function(){
				var opts = this.opts;
				var $parent = $('body');
				var $box = $('<div>').addClass('tip-box in ' + this.opts.type + ' ' + this.opts.position + ' ' + this.opts.style + ' ' + this.opts.animation).appendTo($parent);
				$box.css({
					'max-width' : $parent.width() - 20,
					width : this.opts.width,
					height : this.opts.height
				});
				$box.html('<div class="tip-box-ctrl"></div><div class="tip-box-content">' + this.opts.message + '</div><div class="tip-box-ft"></div>');
				this.$box = $box;
				if (opts.autoDel) {
					$box.find('.tip-box-ft').remove();
					setTimeout(function(){
						$box.removeClass('in').addClass('out');
						setTimeout(function(){
							$box.remove();
						}, 300);
					}, opts.showTime);
				} else if (opts.showBtn !== false) {
					if ($.isPlainObject(opts.showBtn)) {
						var $btn, $ft = $box.find('.tip-box-ft'); 
						for(var i in opts.showBtn){
							$btn = $('<button class="btn">').text(i).appendTo($ft);
							$btn.click(clickProx(opts.showBtn[i]));
						}
					} else {
						$box.find('.tip-box-ft').html('<button class="btn btn-ok">确定</button>');
						$box.find('.btn-ok').click(function(){
							opts.ok();
							$box.remove();
						});
					}
				}
				this.height = $box.height();
				this.width = $box.width();
				this.setPosition($box);
				function clickProx(fn){
					return function(){
						fn && fn();
						$box.remove();
					};
				}
			},
			setPosition : function($box){
				var pHeight = mami.browser.isMobile ? docClientHeight : document.documentElement.clientHeight,
					pWidth = mami.browser.isMobile ?  docClientWidth : document.documentElement.clientWidth,
					top, left;
				switch(this.opts.position){
				case 'center':
					top  = (pHeight - this.height) / 2;
					left = (pWidth - this.width) / 2;
					$box.css({
						top: top,
						left: left
					});
					break;
				case 'left' :
					break;
				case 'bottom' :
					break;
				case 'right' :
					break;
				case 'topLeft' :
				case 'topRight' :
					break;
					default: 
				}
			},
			bindEvent: function(){
				
			},
			remove : function(){
				this.$box.remove();
			}
	};
	var Tween = {
		linear : function(start, alter, curTime, duration){
			return start + (curTime/ duration) * alter;
		},
		easeIn : function(start, alter, curTime, duration){
			return start + Math.pow(curTime / duration) * alter; 
		},
		eaesOut : function(start, alter, curTime, duration){
			var progress = curTime / duration;
			return start - (Math.pow(progress, 2) - 2 * progess) * alter;
		}
	};
	var Animate = function Animate(el, opts){
		if (!(this instanceof Animate)) {
			return new Animate(el, opts);
		}
		this.$el = $(el);
		this.curTime = 0;
		this.opts = $.extend({
			start : 0,
			alter : 0,
			running: foo,
			before : foo,
			end : foo,
			duration: 1000,
			step : 20,
			css : '',
			timing : 'linear',
			autoRun: true
		}, opts);
		if (this.opts.autoRun) {
			this.run();
		}
	};
	Animate.prototype = {
		run : function(){
			this.opts.before.apply(this.$el, []);
			this._run();
		},
		_run : function(){
			var that = this;
			if (that.curTime <= that.opts.duration) {
				setTimeout(function(){
					var opts = that.opts,
						delta = Tween[opts.timing](opts.start, opts.alter, that.curTime, opts.duration);
					that.curTime += that.opts.step;
					that.$el.css(opts.css, delta);
					opts.running.apply(that.$el, [delta]);
					that._run();
				}, that.opts.step);
			} else {
				that.opts.end.call(that.$el);
			}
		}
	};
	var addEvent = function(){
		if (window.addEventListener) {
			return function(el, type, fn, capture){
				el.addEventListener(type, fn, capture);
			};
		} else if (window.attachEvent) {
			return function(el, type, fn){
				el.attachEvent('on' + type, fn);
			};
		} else {
			el['on' + type] = function(){
				fn(window.event);
			};
		}
	}();
	// crypto 
	/** base64 */
	var base64EncodeChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	var base64DecodeChars = new Array(-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, 62, -1, -1, -1, 63, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, -1, -1, -1, -1, -1, -1, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, -1, -1, -1, -1, -1, -1, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, -1, -1, -1, -1, -1);
	/**
	 * base64编码
	 * @param {Object} str
	 */
	function base64encode(str){
	    var out, i, len;
	    var c1, c2, c3;
	    len = str.length;
	    i = 0;
	    out = "";
	    while (i < len) {
	        c1 = str.charCodeAt(i++) & 0xff;
	        if (i == len) {
	            out += base64EncodeChars.charAt(c1 >> 2);
	            out += base64EncodeChars.charAt((c1 & 0x3) << 4);
	            out += "==";
	            break;
	        }
	        c2 = str.charCodeAt(i++);
	        if (i == len) {
	            out += base64EncodeChars.charAt(c1 >> 2);
	            out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
	            out += base64EncodeChars.charAt((c2 & 0xF) << 2);
	            out += "=";
	            break;
	        }
	        c3 = str.charCodeAt(i++);
	        out += base64EncodeChars.charAt(c1 >> 2);
	        out += base64EncodeChars.charAt(((c1 & 0x3) << 4) | ((c2 & 0xF0) >> 4));
	        out += base64EncodeChars.charAt(((c2 & 0xF) << 2) | ((c3 & 0xC0) >> 6));
	        out += base64EncodeChars.charAt(c3 & 0x3F);
	    }
	    return out;
	}
	/**
	 * base64解码
	 * @param {Object} str
	 */
	function base64decode(str){
	    var c1, c2, c3, c4;
	    var i, len, out;
	    len = str.length;
	    i = 0;
	    out = "";
	    while (i < len) {
	        /* c1 */
	        do {
	            c1 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
	        }
	        while (i < len && c1 == -1);
	        if (c1 == -1) 
	            break;
	        /* c2 */
	        do {
	            c2 = base64DecodeChars[str.charCodeAt(i++) & 0xff];
	        }
	        while (i < len && c2 == -1);
	        if (c2 == -1) 
	            break;
	        out += String.fromCharCode((c1 << 2) | ((c2 & 0x30) >> 4));
	        /* c3 */
	        do {
	            c3 = str.charCodeAt(i++) & 0xff;
	            if (c3 == 61) 
	                return out;
	            c3 = base64DecodeChars[c3];
	        }
	        while (i < len && c3 == -1);
	        if (c3 == -1) 
	            break;
	        out += String.fromCharCode(((c2 & 0XF) << 4) | ((c3 & 0x3C) >> 2));
	        /* c4 */
	        do {
	            c4 = str.charCodeAt(i++) & 0xff;
	            if (c4 == 61) 
	                return out;
	            c4 = base64DecodeChars[c4];
	        }
	        while (i < len && c4 == -1);
	        if (c4 == -1) 
	            break;
	        out += String.fromCharCode(((c3 & 0x03) << 6) | c4);
	    }
	    return out;
	}
	/**
	 * utf16转utf8
	 * @param {Object} str
	 */
	function utf16to8(str){
	    var out, i, len, c;
	    out = "";
	    len = str.length;
	    for (i = 0; i < len; i++) {
	        c = str.charCodeAt(i);
	        if ((c >= 0x0001) && (c <= 0x007F)) {
	            out += str.charAt(i);
	        }
	        else 
	            if (c > 0x07FF) {
	                out += String.fromCharCode(0xE0 | ((c >> 12) & 0x0F));
	                out += String.fromCharCode(0x80 | ((c >> 6) & 0x3F));
	                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
	            }
	            else {
	                out += String.fromCharCode(0xC0 | ((c >> 6) & 0x1F));
	                out += String.fromCharCode(0x80 | ((c >> 0) & 0x3F));
	            }
	    }
	    return out;
	}
	/**
	 * utf8转utf16
	 * @param {Object} str
	 */
	function utf8to16(str){
	    var out, i, len, c;
	    var char2, char3;
	    out = "";
	    len = str.length;
	    i = 0;
	    while (i < len) {
	        c = str.charCodeAt(i++);
	        switch (c >> 4) {
	            case 0:
	            case 1:
	            case 2:
	            case 3:
	            case 4:
	            case 5:
	            case 6:
	            case 7:
	                // 0xxxxxxx
	                out += str.charAt(i - 1);
	                break;
	            case 12:
	            case 13:
	                // 110x xxxx 10xx xxxx
	                char2 = str.charCodeAt(i++);
	                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
	                break;
	            case 14:
	                // 1110 xxxx10xx xxxx10xx xxxx
	                char2 = str.charCodeAt(i++);
	                char3 = str.charCodeAt(i++);
	                out += String.fromCharCode(((c & 0x0F) << 12) | ((char2 & 0x3F) << 6) | ((char3 & 0x3F) << 0));
	                break;
	        }
	    }
	    return out;
	}
	/** base64 end */
	/** date format **/
	function dateFormat(date, pattern){
		if (typeof date == 'number') {
			date = new Date(date);
		}
		pattern = pattern || 'yyyy-MM-dd hh:mm:ss';
		var ks = {
				MM : date.getMonth() + 1,
				yyyy: date.getFullYear(),
				dd: date.getDate(),
				hh: date.getHours(),
				mm: date.getMinutes(),
				ss: date.getSeconds(),
				ms: date.getMilliseconds(),
				day: date.getDay()
		};
		for (var i in ks) {
			pattern = pattern.replace(new RegExp(i, 'g'), ks[i]);
		}
		return pattern;
	}
	/** add download bar **/
	function addDownloadBar(text, url){
		text = text || '下载妈蜜，马上参加热门活动';
		url = url || '/download.htm';
		if (mami.env.isMamiApp) {
			return;
		}
		$('body');
	}
	/** 下拉到顶部或底部 **/
	var scrollListener = {
			ontop: [],
			onbottom: []
	};
	var scrollHandler = function(e){
		var de = document.documentElement;
		if (de.scrollHeight <= de.clientHeight) {
			return;
		}
		var top = window.pageYOffset || document.body.scrollTop;
		if (top === 0) {
			for (var i = 0, len = scrollListener.ontop.length; i < len; i += 1) {
				handlers.ontop[i]();
			}
		} else if (top + de.clientHeight >= de.scrollHeight - 5) {
			for (var i = 0, len = scrollListener.onbottom.length; i < len; i += 1) {
				scrollListener.onbottom[i]();
			}
		}
	};
	var onscrolltop = function(fn){
		typeof fn === 'function' ? scrollListener.ontop.push(fn) : '';
	};
	var onscrollbottom = function(fn){
		typeof fn === 'function' ? scrollListener.onbottom.push(fn) : ''; 
	};
	$(window).bind('scroll', scrollHandler);
	// interface to mami
	window.mami = {
		onscrollbottom: onscrollbottom,	
		onscrolltop: onscrolltop,
		cookie : cookie,
	    addDownloadBar: addDownloadBar,
		location2Obj  : location2obj,
		obj2SearchUrl : obj2search, 
		Animate   : Animate,
		uuid      : function(){
			var tokens = 'abcdfeghijklmnopqrstuvwxzy0123456789_'.split('');
			var uuid = [];
			var len = tokens.length;
			for (var i = 0; i < 64; i++) {
				uuid[i] = tokens[parseInt(Math.random() * len)];
			}
			return uuid.join('');
		},
		dateFormat: dateFormat,
		DetailBox : DetailBox,
		TopicBox  : TopicBox,
		addEvent  : addEvent,
		Recommed  : Recommed,
		getQueryParams : function(){
			return $.extend({}, localParams);
		},
		Ajax : Ajax,
		download : function(){
			location.href = 'http://d.mamiguimi.com/docs/download.htm';
		},
		crypto  : {
			base64 : {
				encode : base64encode,
				decode : base64decode
			}
		},
		browser : browser,
		env     : browser,
		tip : function(opts){
			if (typeof opts == 'string') {
				return TipBox({
					message : opts
				});
			}
			return TipBox(opts);
		},
		closeAllTip : function(){
			return TipBox.closeAll();
		},
		share : function(message, fn){
			if (typeof message == 'function') {
				fn = message;
				message = '';
			}
			message = message || '请点击右上角<br>将它发送给指定朋友<br>或分享到朋友圈';
			fn = fn || function(){};
			var $div = $('<div>').addClass('share-mask').appendTo(document.body);
			$div.html('<div class="arrow"><img src="/static/image/share/share-arrow.png"></div><div class="share-content">' + message + '</div>').on('click', function(){
				fn($div);
				$div.remove();	
			});
		},
		nodeServer: {
			json : nodeAjax
		},
		downloadLink: function(search){
			return 'http://d.mamiguimi.com/docs/download.htm' + (search ? '?' + search : '');
		}
	};
	/** set auth params in cookie nessesary only**/
	var queryData = location2obj();
	var userId = queryData.fmbg;
	var token = mami.crypto.base64.decode((queryData.hkju || '').replace(/-/g, '+').replace(/_/g, '/'));
	userId && cookie.setCookie('fmbg', userId);
	token && cookie.setCookie('hkju', token);
	/** end set **/
}($));
// 百度统计
var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "//hm.baidu.com/hm.js?0699ee4ca55ba8928d063445f4a4520f";
  var s = document.getElementsByTagName("script")[0]; 
  s.parentNode.insertBefore(hm, s);
})();
// 浏览量统计
var activityId = mami.location2Obj().activityId;
if (activityId) {
	mami.Ajax.json({
		url : '/activity/activity/updateBrowseCount.json',
		data : {
			activityId: mami.location2Obj().activityId
		}
	});
}
// piwik 统计
$('[data-piwik]').bind('click', function(){
	if (window._paq){
		_paq.push(['trackEvent', mami.env.isMamiApp ? 'app内' : 'app外', $(this).attr('data-piwik')]);
	} 
});