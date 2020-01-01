PManager.setModuleValue('zepto', $);
PManager.load('jquery, mami_util, mami_webshare, mami_qiniu, exif', function(){
	$('body').addClass('ny-loading');
	var viewWidth = $('#container').width();
	var templates = [];
	var query = mami.location2Obj();
	query.index = query.index || 0;
	// events
	$('#list').on('click', '.template', function(){
		var index = $(this).attr('data-index');
		if (!mami.env.isMamiApp && index > 1) {
			return popup($('#container'), 'http://7xlxz1.com2.z0.glb.qiniucdn.com/newywar_dialog_download.png', function(){
				location.href = 'http://d.mamiguimi.com/docs/download.htm?source=chunwan';
			});
		}
		location.href = './index.htm?index=' + $(this).attr('data-index');
	});
	$('#btn-made').bind('click', function(){
		var index = +query.index;
		var list = templates[index],
			instance = list[0];
		if (instance) {
			instance.disabled = false;
			instance.$wrapper.closest('.produceWrapper').show();
			window.scrollTo(0,0);
			$('body').addClass('overhide');
		}
	});
	$('#btn-share').bind('click', function(){
		mami.share('<div class="img-wrap"><img src="http://7xlxyi.media1.z0.glb.clouddn.com/newyear_dialog_share_320p_20160204.png"></div>');
	});
	var popup = function($parent, bg, fn){
		$parent = $parent || $('body');
		var $dialog = $('<div>').addClass('dialog'),
			$dialogMask = $('<div>').addClass('dialog-mask');
		$dialog.html('<div class="content relative"><div class="img-wrap"><img src="' + bg + '"></div><button class="btn-close"></button><button class="btn-button"></button></div>');
		$parent.append($dialogMask).append($dialog);
		$dialog.find('.btn-close, .btn-button').bind('touchstart click', function(){
			$dialog.remove();
			$dialogMask.remove();
			if ($(this).hasClass('btn-button')) {
				fn && fn();
			}
			return false;
		});
		return $dialog;
	};
	var audioSrc = ['http://7xlxyi.media1.z0.glb.clouddn.com/newyear_music_1.mp3',
	              'http://7xlxyi.media1.z0.glb.clouddn.com/newyear_music_2.mp3',
	              'http://7xlxyi.media1.z0.glb.clouddn.com/newyear_music_3.mp3',
	              'http://7xlxyi.media1.z0.glb.clouddn.com/newyear_music_4.mp3'];
	var audio = document.createElement('audio');
	var martixs = [[[621,1104,140,384,145,180]],
	              [[621,1104,244,363,160,186]],
	              [[621,1104,362,400,145,180]],
	              [[621,1104,222,355,173,200]]];
	var hairs = [
	             [{url: "./css/img/hair_0.png", width: "200%", left: "-62%", top: "-25%", eyeline: '42%'}],
	             [{"url":"./css/img/hair_4.png", "width": "120%", "left": "-10%", "top": "-45%", eyeline: '42%'}],
	             [{url: "./css/img/hair_2.png", width: "210%", left: "-61%", top: "-9%", eyeline: '42%'}],
	             [{"url": "./css/img/hair_1.png", "width": "110%", "height": "200%", "top": "-18%", "left": "-5%", eyeline: '42%'}]];
	var templateSrc = ['assets/newyear_template_1_0203.jpg',
	                   'assets/newyear_template_2.jpg',
	                   'assets/newyear_template_3.jpg',
	                   'assets/newyear_template_4.jpg'];
	var thumbs = ['assets/newyear_lite_bg_0_0203.jpg',
	              'assets/newyear_lite_bg_1_0203.jpg',
	              'assets/newyear_lite_bg_2_0203.jpg',
	              'assets/newyear_lite_bg_3_0203.jpg'];
	function fillThumbs(index){
		var $row = $('#list .row'),
			html = '';
		index = index || 0;
		for (var i = 0, len = thumbs.length; i<len; i+=1) {
			if (i == index) {
				continue;
			}
			html += '<div class="one third"><div class="img-wrap template" data-index="' + i + '"><img src="' + thumbs[i]+ '"></div></div>';
		}
		$row.html(html);
	}
	function createWrapper(index){
		var martix = martixs[index],
			src = templateSrc[index],
			hair = hairs[index],
			$wrapper = $('<div>').addClass('activeWrapper img-wrap relative').prop('id', 'activeWrapper_' + index),
			canvasList = [];
		$wrapper.html('<img src="' + src + '">').find('img').bind('load', function(){
			$('body').removeClass('ny-loading');
		}).bind('error', function() {
			$('body').removeClass('ny-loading');
		});
		for (var i = 0, len = martix.length; i < len; i += 1) {
			canvasList[i] = createHeadWrapper($wrapper, martix[i], hair[i] || {}, i);
		}
		$('#container').append($wrapper);
		audio.src = audioSrc[index];
		audio.loop = true;
		return canvasList;
	}
	function createHeadWrapper($container, points, hair, index){
		var	scale = viewWidth / points[0],
			x = points[2] * scale,
			y = points[3] * scale,
			w = points[4] * scale,
			h = points[5] * scale,
			liteCanvas = null;
		var $wrap = $('<div>').addClass('wrapper').attr('data-index', index).css({
			width: w,
			height: h,
			position: 'absolute',
			left: x,
			top: y
		}).append($('<div>').addClass('hair').css({
			"background-image": 'url("' + hair.url + '")',
			width: hair.width,
			height: hair.height,
			top: hair.top,
			left: hair.left
		})).append('<div class="canvasWrapper" style="width:' + w + 'px;height:' + h + 'px"></div>');
		var canvas = $('<canvas>').prop({
			width: w,
			height: h
		}).appendTo($wrap.find('.canvasWrapper'))[0];
		$container.append($wrap);
		/**
		 * 2016-02-02 修改制作逻辑
		 * */
		$wrap.bind('click', function(){
			$('#btn-made').trigger('click');
		});
		// 制作层
		var times = 2.5;
		var $produce = $('<div>').addClass('produceWrapper').css({
			width: document.documentElement.clientWidth,
			height: document.documentElement.clientHeight,
		});
		var $produceOutter = $('<div>').addClass('produceOutterWrapper');
		var $produceInner = $('<div>').addClass('produceInnerWrapper').append('<div class="canvasWrapper" style="width:' + (w * times) + 'px;height:' + (h * times) + 'px"></div>');
		$produceInner.append('<div class="eye-line" style="top:' + (hair.eyeline) + '">眼睛的位置</div>');
		var produceCanvas = $('<canvas>').prop({
			width: w * times,
			height: h * times
		}).appendTo($produceInner.find('.canvasWrapper'))[0];
		$produce.append($produceOutter.append($produceInner));
		$container.append($produce);
		var $ctrl = $('<div>').html('<div class="fouth one"><div class="scale-out">放大</div></div><div class="fouth one"><div class="scale-in">缩小</div></div><div class="fouth one"><div class="rotate">旋转</div></div><div class="fouth one"><div class="done">完成</div></div>').addClass('ctrl row align-center').css({
			top: y + h + 5
		});
		$wrap.after($ctrl);
		var $produceCtrl = $('<div>').addClass('ctrl align-center').html('<div class="row"><div class="half one padding"><div class=""><button class="btn-rotate">90°旋转</button></div></div><div class="half one padding"><div class=""><button class="btn-import">导入</button></div></div></div><div class="padding"><button class="btn-complete">确定</button></div>');
		$produce.append($produceCtrl);
		liteCanvas = new LiteCanvas(produceCanvas, $produceCtrl);
		liteCanvas.on('end', function(){
			(audio.played == null || audio.played.length == 0) && audio.play();
			liteCanvas.setOutputMimeType('image/jpeg');
			var base64 = liteCanvas.getImageBase64();
			$wrap.addClass('animation').find('.canvasWrapper').css('background-image', 'url("' + base64 + '")');
			liteCanvas.$wrapper.addClass('scaleOut');
			setTimeout(function(){
				liteCanvas.$wrapper.removeClass('scaleOut').closest('.produceWrapper').hide();
			}, 300);
			$('body').removeClass('overhide');
			mami.Qiniu.upload64({
				base64: base64.substr(base64.indexOf(',') + 1),
				mimeType: 'image/jpeg',
				key: 'new_year_index' + query.index + '_' + (query.fmbg ? 'id' + query.fmbg + '_' : '') + Date.now() + '_' + ((Math.random() * 10000) >> 0),
				callback: function(res){
					// change share url
					var link = 'http://app.mamiguimi.com/docs/actives/newyear/index.htm?' +
								mami.obj2SearchUrl({
									index: query.index,
									name: res.key
								});
					$('#shareUrl').val(link);
					setupWxShare({
						link: link
					});
					$('#btn-made').hide();
					$('#btn-share').show();
				}
			});
		});
		if (query.name) {
//			liteCanvas.setDisabled(true);
			// draw
			var img = new Image;
			img.src = mami.Qiniu.domain + query.name;
			$wrap.addClass('loading');
			img.onload = function(){
				$wrap.removeClass('loading').addClass('animation').find('.canvasWrapper').css('background-image', 'url("' + img.src + '")');
			};
		}
		return liteCanvas;
	}
    function LiteCanvas(canvas, $ctrl){
    	this.canvas = canvas;
    	this.context2D = canvas.getContext('2d');
    	this.canvasWidth = canvas.width;
    	this.canvasHeight = canvas.height;
    	this.movePoints = {};
    	this.$wrapper = $(canvas).parent().parent();
    	this.$ctrl = $($ctrl);
    	this.events = {};
    	this.bindEvent($ctrl);
    }
    LiteCanvas.prototype = {
    		scaleTimes: 1.2,
    		clientEvents: /mobile/i.test(navigator.userAgent) ? ['touchstart', 'touchmove', 'touchend'] : ['mousedown', 'mousemove', 'mouseup'],
    		isIphone: /iPhone OS/i.test(navigator.userAgent),
    		IOS_BUG_IMG_SIZE: 1024 * 1024,
    		setDisabled: function(disabled){
    			this.disabled = !!disabled;
    		},
    		bindEvent: function($ctrl){
    			var instance = this;
    			this.$ipt = $('<input>').prop({
    				type: 'file',
    				accept: 'image/*'
    			}).addClass('hide').appendTo('body').bind('change', function(){
    				var file = this.files[0];
    				if (file) {
    					instance.$wrapper.addClass('loading');
    					instance.fixCnavasOnIOS(file);
    					instance.readImageFile(file);
    					// show ctrl buttons
    					instance.$ctrl.show();
    					instance.$wrapper.removeClass('animation');
    				}
    				this.value = "";
    			});
    			$(instance.$wrapper.parent()).bind(instance.clientEvents[0], instance._eventProxy(instance._eventStart, instance)).bind(instance.clientEvents[1], instance._eventProxy(instance._eventMove, instance)).bind(instance.clientEvents[2], instance._eventProxy(instance._eventEnd, instance));
    			// ctrl buttons
    			$($ctrl).find(".scale-out").bind('click', instance._eventProxy(instance._eventScaleOut, instance));
    			$($ctrl).find(".scale-in").bind('click', instance._eventProxy(instance._eventScaleIn, instance));
    			$($ctrl).find(".rotate").bind('click', instance._eventProxy(instance._eventRotate, instance));
    			$($ctrl).find(".done").bind('click', instance._eventProxy(instance._eventComplete, instance));
    			/**
    			 * new change
    			 * */
    			$($ctrl).find('.btn-complete').bind('click', instance._eventProxy(instance._eventComplete, instance));
    			$($ctrl).find('.btn-rotate').bind('click', instance._eventProxy(instance._eventFixRotate, instance));
    			$($ctrl).find('.btn-import').bind('click', instance._eventProxy(instance._handClick, instance));
    		},
    		setOutputMimeType: function(mimeType){
    			this.mimeType = mimeType;
    		},
    		setOutputQuality: function(quality){ /* 0 - 1 */
    			if (quality > 0 && quality <= 1) {
    				this.quality = quality;
    			}
    		},
    		_eventProxy: function(fn, context){
    			var that = this;
    			return function(e){
    				if (that.disabled === true) {
    					return;
    				}
    				var originalEvent = e.originalEvent;
    				fn.call(context, originalEvent);
    			};
    		},
    		_eventScaleOut: function(){
    			if (this.image) {
    				this.scale *= this.scaleTimes;
    				this.drawImg();
    			}
    		},
    		_eventScaleIn: function(){
    			if (this.image) {
    				this.scale /= this.scaleTimes;
    				this.drawImg();
    			}
    		},
    		_eventFixRotate: function(){
    			var angle = +(Math.PI / 2).toFixed(3),
    				mod = this.rotate % Math.PI;
    			mod = Math.abs(+mod.toFixed(3));
    			if (this.image) {
    				if (mod < 0.1 || Math.abs(mod - angle) < 0.1){
    					this.rotate += angle;
    				} else {
    					this.rotate += mod > angle / 2 ? (angle - mod) : -mod;
    				}
    				this.drawImg();
    			}
    		},
    		_eventRotate: function(){
    			if (this.image) {
    				this.rotate += (Math.PI / 2);
    				this.drawImg();
    			}
    		},
    		_eventComplete: function(e){
//    			this.$ctrl.hide();
    			this.$wrapper.addClass('animation');
    			// trigger 'end'
    			var cbs = this.events.end || [];
    			for (var i = 0, len = cbs.length; i < len; i+=1) {
    				cbs[i].apply(this, [e]);
    			}
    		},
    		_eventStart: function(e){
    			this.startX = this.x;
    			this.startY = this.y;
    			this.move = false;
    			this.focus = true;
    			if (e.type == 'touchstart') {
    				var originEvent = e;
    				e = e.changedTouches[0];
    				this.scaling = originEvent.touches.length > 1;
    				this.scaling && this.initScaleState(originEvent, e);
    			}
    			this.movePoints = {
    				start_x: e.clientX,
    				start_y: e.clientY,
    				start_img_x: this.x,
    				start_img_y: this.y
    			};
    		},
    		_eventMove: function(e){
    			if (this.focus == false || this.image == null) {
    				return;
    			}
    			this.move = true;
    			if (this.scaling == false && e.type == 'touchmove' && e.touches.length > 1) {
    	            this.scaling = true;
    	            this.initScaleState(e);
    	        } else if (e.touches == null || e.touches.length == 1) {
    	            this.scaling = false;
    	        }
    	        var event = e.type == 'touchmove' ? e.changedTouches[0] : e;
    	        if (this.scaling) {
    	        	this._handleScale(event, e);
    	        } else {
    	        	this._handleMove(event, e);
    	        }
    		},
    		_eventEnd: function(e){
    			this.focus = false;
    			if (this.move || this.scaling) {
    				e.stopPropagation();
    				e.stopImmediatePropagation && e.stopImmediatePropagation();
    	            e.preventDefault();
    			} else {
//    				this._handClick(e);
    			}
    		},
    		_handClick: function(e){
    			this.$ipt.trigger('click');
    		},
    		_handleScale: function(e, nativeEvent){
    			 var points = this.calculateScalePoints(nativeEvent),
                 	 distance = Math.sqrt(Math.pow((points.scaleStart.rectX - points.scaleEnd.rectX), 2) + Math.pow((points.scaleStart.rectY - points.scaleEnd.rectY), 2));
    			 console.log('points, distance', points, distance);
	             // 只旋转，只缩放，判断权重比例，一方过小则忽略
	             var scale = this.initialScale * distance / this.initialDistance,
	                 deltaScale = Math.abs(this.scale - scale),
	                 rotate = this.momentRotate + Math.atan2(points.scaleStart.rectY - points.scaleEnd.rectY, points.scaleStart.rectX - points.scaleEnd.rectX) - this.initialRotate,
	                 deltaRotate = Math.abs(rotate - this.rotate);
	             if (deltaRotate + deltaScale != 0) {
	                 if (deltaRotate / (deltaRotate + deltaScale) > 0.65) {
	                     this.rotate = rotate;
	                 } else if (deltaScale / (deltaRotate + deltaScale) > 0.65) {
	                     this.scale = scale;
	                 }
	             }
	             // 只缩放，旋转不绘制
                 this.scale = scale;
                 this.rotate = rotate;
                 console.log('scale', this.scale);
	             this.drawImg();
    			 nativeEvent.stopPropagation();
    			 nativeEvent.preventDefault();
    			 return false;
    		},
    		initScaleState: function(e){
                var points = this.calculateScalePoints(e);
                var scaleStart = this.scaleStart = points.scaleStart;
                var scaleEnd = this.scaleEnd = points.scaleEnd;
                this.initialDistance = Math.sqrt(Math.pow((scaleStart.rectX - scaleEnd.rectX), 2) + Math.pow((scaleStart.rectY - scaleEnd.rectY), 2));
                this.initialRotate = Math.atan2((scaleStart.rectY - scaleEnd.rectY), (scaleStart.rectX - scaleEnd.rectX));
                this.initialScale = this.scale;
                this.momentRotate = this.rotate;
            },
    		_handleMove: function(e, nativeEvent){
    			this.x = this.movePoints.start_img_x + (e.clientX - this.movePoints.start_x);
    			this.y = this.movePoints.start_img_y + (e.clientY - this.movePoints.start_y);
                this.drawImg();
                nativeEvent.stopPropagation();
                nativeEvent.preventDefault();
                return false;
    		},
    		calculateScalePoints: function(e){
                var touches = e.touches,
                    offset = $(this.canvas).offset(),
                    points = {};
                for (var i = 0; i < 2; i+=1) {
                    points[i == 0? 'scaleStart' : 'scaleEnd'] = {
                        screenX : touches[i].clientX + (window.pageXOffset || document.body.scrollLeft),
                        screenY : touches[i].clientY + (window.pageYOffset || document.body.scrollTop),
                        rectX : touches[i].clientX + (window.pageXOffset || document.body.scrollLeft) - offset.left,
                        rectY : touches[i].clientY + (window.pageYOffset || document.body.scrollTop) - offset.top
                    };
                }
                return points;
            },
            drawEllipseView: function() {
            	var a = x = this.canvasWidth / 2,
            		b = y = this.canvasHeight / 2,
                	ox = 0.5 * a,
                    oy = 0.6 * b,
                    context = this.context2D;
            	// 恢复默认绘制模式
            	context.globalCompositeOperation = 'source-over';
                context.save();
                context.translate(x, y);
                context.beginPath();
                context.moveTo(0, b);
                context.bezierCurveTo(ox, b, a, oy, a, 0);
                context.bezierCurveTo(a, -oy, ox, -b, 0, -b);
                context.bezierCurveTo(-ox, -b, -a, -oy, -a, 0);
                context.bezierCurveTo(-a, oy, -ox, b, 0, b);
                context.closePath();
                context.fillStyle = '#1c1c20';
                context.fill();
                context.restore();
            },
    		drawImg: function(){
    			console.log(this);
    			this.context2D.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
    			// 绘制椭圆，限定显示区域
    			this.drawEllipseView();
    			this.context2D.globalCompositeOperation = 'source-atop';
    			// transform
    			this.context2D.beginPath();
				this.context2D.save();
				this.context2D.translate(this.x + this.w / 2, this.y + this.h / 2);
				this.context2D.save();
				this.context2D.rotate(this.preRotate + this.rotate);
    			this.context2D.drawImage(this.image, -this.w * this.scale / 2, -this.h * this.scale / 2, this.w * this.scale, this.h * this.scale);
    			// restore
				this.context2D.restore();
				this.context2D.restore();
    		},
    		resetPosition: function(){
    			var img = this.image,
    				w = img.width,
    				h = img.height,
    				c_w = this.canvasWidth,
    				c_h = this.canvasHeight,
    				t_w = w,
    				t_h = h,
    				// 倍率
    				rate = 2;
    			// 缩小显示
    			if (w > c_w * rate) {
    				t_w = c_w * rate;
    				t_h = (t_w / w) * h;
    			}
    			if (h > c_h * rate) {
    				t_h = c_h * rate;
    				t_w = (t_h / h) * w;
    			}
    			this.w = t_w;
    			this.h = t_h;
    			this.scale = 1;
    			this.rotate = 0;
    			this.x = (c_w - t_w) / 2;
    			this.y = (c_h - t_h) / 2;
    		},
    		readImageFile: function(file){
    			var img = this.image = new Image;
    			var that = this;
    			img.onload = function(){
    				that.resetPosition();
    				that.drawImg();
    				that.$wrapper.removeClass('loading');
    			};
    			if (!window.FileReader) {
    				alert('你的手机还不支持哦');
    			} else {
    				var fr = new FileReader();
    				fr.onload = function(){
    					var exif = EXIF.readFromBinaryFile(that.base64ToArrayBuffer(fr.result));
        				var orientation = exif ? exif.Orientation : 1;
    					img.src = fr.result;
    					switch(orientation){
    					case 3:
    						that.preRotate = Math.PI;
    						break;
    					case 6:
    						that.preRotate = Math.PI / 2;
    						break;
    					case 8:
    						that.preRotate = Math.PI * 1.5;
    					break;
    					default:
    						that.preRotate = 0;
    					}
    				};
    				fr.readAsDataURL(file);
    			}
    		},
    		base64ToArrayBuffer : function(base64){
    			base64 = base64.replace(/^data\:([^\;]+)\;base64,/gmi, '');
    		    var binary_string = window.atob(base64);
    		    var len = binary_string.length;
    		    var bytes = new Uint8Array( len );
    		    for (var i = 0; i < len; i++) {
    		        bytes[i] = binary_string.charCodeAt(i);
    		    }
    		    return bytes.buffer;
    		},
    		fixCnavasOnIOS: function(file){
    			/** see this.readImageFile use exif.js **/
    		},
    		getImageBase64: function(){
    			if (this.image == null) {
    				return '';
    			}
    			// 绘制1.5倍图输出, 默认png格式.95清晰度, 可能有透明度
    			var times = 1.5,
    				w = (this.canvasWidth * times) >> 0,
    				h = (this.canvasHeight * times) >> 0,
    				canvas = document.createElement('canvas'),
    				context = canvas.getContext('2d');
    			canvas.width = w;
    			canvas.height = h;
    			context.save();
    			context.translate((this.x + this.w / 2) * times, (this.y + this.h / 2) * times);
    			context.rotate(this.preRotate + this.rotate);
    			context.drawImage(this.image, -this.w * this.scale * times / 2, -this.h * this.scale * times / 2, this.w * this.scale * times, this.h * this.scale * times);
    			// restore
    			context.restore();
    			return canvas.toDataURL(this.mimeType || "image/png", this.quality || 0.95);
    		},
    		on: function(type, cb){
    			switch(type){
    			case 'end':
    				this.events.end = this.events.end || [];
    				this.events.end.push(cb);
    			}
    		},
    		changeImage: function(){
    			this.$ipt.trigger('click');
    		}
    };
    function setupWxShare(obj){
    	obj = $.extend({
    		title: '宝贝上春晚啦',
    		desc: '我家宝贝上春晚啦，快来围观→',
    		imgUrl: 'http://7xlxz1.com2.z0.glb.qiniucdn.com/newyear_share_pic.jpg',
    		link: location.href
    	}, obj);
		mami.wxShareApi.setConfig({
			onMenuShareTimeline: $.extend({}, obj, {title: obj.desc}),
			onMenuShareAppMessage: obj
		}).init();
    }
    // init
    templates[query.index] = createWrapper(query.index);
    fillThumbs(query.index);
    setupWxShare();
    // play music
    $('body').append(audio);
    (function(){
    	if (query.name) {
    		audio.load();
    		audio.play();
    		var played = audio.played && audio.played.length > 0;
    		$('body').append(audio).bind('touchstart', function(){
    			if (played == false) {
    				audio.play();
    				played = true;
    			}
    		});
    	}
	}());
});
