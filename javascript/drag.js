(function(win){
	var doc = win.document,
		timeStamp = new Date().getTime(),
		rtrim = /^\s+|\s+$/g,
		foo = function(){},
		core_slice = [].slice,
		extend = function(){
			var target = arguments[0], i = 1, len = arguments.length;
			for (; i < len; i++) {
				copy = arguments[i];
				for (var k in copy) {
					if (copy[k] !== undefined) {
						target[k] = copy[k];
					}
				}
			}
			return target;
		};
	gui = win.gui || {};
	var linear = function(t,b,c,d){
		return c*t/d + b;
	};
	var animation = function(){
		function run(el, style, from, offest, duration, t){
			t += 50;
			t = Math.min(t, duration);
			setTimeout(function(){
				el.setCss(style, linear(t, from, offest, duration));
				if (t < duration) {
					run(el, duration, style, from, offet, t);
				}
			}, 50);
		};
		return function(el, style, from, offset, duration){
			duration = duration || 1000;
			if (el.length) {
				for (var i = 0, len = el.length; i < len; i++) {
					animation(el[i], style, from, offset, duration);	
				}
			} else {
				setCss(el, style, from);
				run(el, style, from, offest, duration, 0);
			}
		};
	}();
	var _id = function(id){
		return doc.getElementById(id);
	};
	var each = function(arr, fn){
		var len = arr.length,
			i = 0;
		for (; i < len; i++) {
			fn && fn(arr[i], i);
		}
	};
	var trim = function(s){
		if (s == null) {
			return '';
		}
		s += '';
		return s.trim ? s.trim() : s.replace(rtrim, '');
	};
	var merge = function(a, b){
		var len = a.length,
			j = 0,
			n = b.length;
		if ('number' === typeof n) {
			for (; j < n; j++) {
				a[len++] = b[j];
			}
		} else {
			while(b[j]){
				a[len++] = b[j++];
			}
		}
		a.length = len;
		return a;
	};
	var getElesByClass = function(s, p){
		var r = [], i, cs, eles;
		s = trim(s);
		p = p || doc;
		if (p.length) {
			for (i = 0, len = p.length; i < len; i++) {
				r = merge(r, getElesByClass(s, p[i]));
			}
			return r;
		} 
		cs = s.split(',');
		if (cs.length > 1) {
			for (i = 0, len = cs.length; i < len; i++) {
				r = merge(r, getElesByClass(cs[i], p));
			}
			return r;
		}
		if (p.getElementsByClassName) {
			return merge(r, p.getElementsByClassName(s));
		}
		eles = p.getElementsByTagName('*'),
		len = eles.length;
		for (i = 0; i < len; i++) {
			if (hasClass(eles[i], s)) {
				r.push(eles[i]);
			}
		}
		return r;
	};
	var cssNameTrans = function(c){
		var cs = c.split('-');
		if (cs.length === 1) {
			return c;
		} else {
			for (var i = 1, len = cs.length; i < len; i++) {
				cs[i] = upperFirstCase(cs[i]);
			}
			return cs.join('');
		}
		function upperFirstCase(s){
			return s.replace(/^[a-z]/g, function(s){
				return s.toUpperCase();
			});
		}
	};
	// chrome/FF getComputedStyle()[style],  IE currentStyle[style]直接获取需要驼峰命名 FF不支持css写法
	var getCurrentStyle = function getCurrentStyle(el, ids){
		var doc = el.ownerDocument,
			cssStyle = el.currentStyle ? el.currentStyle : (win.getComputedStyle ? win.getComputedStyle(el) : doc.defaultView ? doc.defaultView.getComputedStyle(el) : el.style);
		if ('string' === typeof ids) {
			return cssStyle[cssNameTrans(ids)] || cssStyle[ids];
		} else if (ids) {
			var r = {};
			for (var i in ids) {
				r[ids[i]] = cssStyle[cssNameTrans(ids)] || cssStyle[ids];
			}
			return r;
		}
		return cssStyle;
	};
	var removeClass = function(el, c){
		if (el.length) {
			for (var i = 0, len = el.length; i < len; i++) {
				removeClass(el[i], c);
			}
		} else {
			c = trim(c);
			var cs = c.split(' ');
			var oldClass = el.className;
			if (oldClass) {
				var t = ' ' + oldClass + ' '; 
				for (var  i = 0, len = cs.length; i < len; i++) {
					if (cs[i]) {
						t = t.replace(' ' + cs[i] + ' ', ' ');
					}
				}
				el.className = trim(t);
			}
		}
	};
	var hasClass = function(el, c){
		c = trim(c);
		c = c.split(' ');
		var cs = ' ' + el.className + ' ';
		if (c.length === 1) {
			c = c[0];
			return c ? cs.indexOf(' ' + c + ' ') >= 0 : false;
		} else {
			var fg = true, t;
			for (var i = 0, len = c.length; i < len; i++) {
				t = trim(c[i]);
				fg = t ? cs.indexOf(' ' + t + ' ') >= 0 : fg;
				if (false === fg) {
					break;
				}
			}
			return fg;
		}
	};
	var addClass = function(el, c){
		if (el.length) {
			for (var i = 0, len = el.length; i < len; i++) {
				addClass(el[i], c);
			}
		} else if (!hasClass(el, c)) {
			el.className += (' ' + c);
		}
	};
	var isPercent = function(s){
		return s.indexOf('%') > 0;
	};
	var setCss = function(el, opts, value){
		if (el.length) {
			for (var i = 0, len = el.length; i < len; i++) {
				setCss(el, opts, value);
			}
		} else {
			var type = typeof opts;
			if ('string' === type) {
				el.style[cssNameTrans(opts)] = value;
			} else if ('object' === type) {
				for (var i in opts) {
					setCss(el, i, opts[i]);
				}
			}
		}
		return el;
	};
	var removeEle = function(el){
		if (el.length) {
			for (var i = 0, len = el.length; i < len; i++) {
				removeEle(el[i]);
			}
		} else {
			el.remove ? el.remove() : el.parentNode.removeChild(el);
		}
	};
	var styleUnit = function(){
		var div = doc.createElement('div'),
			t = {};
		doc.body.appendChild(div);
		var style = getCurrentStyle(div);
		for (var i in style) {
			t[i] = style[i];
		}
		removeEle(div);
		return t;
	}();
	var formatEvent = function(e){
		e.target = e.target || e.srcElement;
		return e;
	};
	var addEvent = function(){
		var hp = function(){
			if (doc.addEventListener) {
				return function(el, type, fn, cap){
					var f = fn[timeStamp + '_handler'] = function(event){
						if (false === fn.call(el, formatEvent(event))) {
							preventDefault(event);
							stopPropagation(event);
						}
					};
					el.addEventListener(type, f, cap);
				};
			} else {
				return function(el, type, fn){
					var f = fn[timeStamp + '_handler'] = function(){
						if (false === fn.call(el, formatEvent(win.event))){
							preventDefault(win.event);
							stopPropagation(win.event);
						};
					}; 
					el.attachEvent('on' + type, f);
				};
			}
		}();
		return function(el, type, fn, cap){
			if (el.length) {
				for (var i = 0, len = el.length; i < len; i++) {
					hp(el[i], type, fn, cap);
				}
			} else {
				hp(el, type, fn, cap);
			}
		};
	}();
	var removeEvent = function(){
		if (doc.removeEventListener) {
			return function(el, type, fn, c){
				if (undefined === fn) {
					// remove all
				} else {
					el.removeEventListener(type, fn[timeStamp + '_handler'] || fn, c);
				}
			};
		} else if (doc.detachEvent) {
			return function(el, type, fn){
				if (undefined === fn) {
					// remove all
				} else {
					el.detachEvent ('on' + type, fn[timeStamp + '_handler'] || fn);
				}
			};
		} else {
			return function(el, type){
				el['on' + type] = undefined;
			};
		}
	}();
	var preventDefault =  function(event){
		// std
		event.preventDefault && event.preventDefault();
		// IE
		event.returnValue = false;
	};
	var stopPropagation = function(event){
		// std
		event.stopPropagation && event.stopPropagation();
		event.cancelBubble = true;
	};
	// 页面滚动条位置，计算鼠标初始位置，相对于window.document
	var getScrollOffsets = function(w){
		w = w || win;
		if (w.pageXOffset != null) {
			return {
				x : w.pageXOffset,
				y : w.pageYOffset
			};
		}
		// 标准模式IE或任意
		if (doc.compatMode == 'CSS1Compat') {
			return {y : doc.documentElement.scrollTop, x : doc.documentElement.scrollLeft};
		}
		//怪异模式IE
		return {
			x : doc.body.scrollLeft,
			y : doc.body.scrollTop
		};
	};
	var getOffset = function(e){
		var x = 0, y = 0,
			left = 0, top = 0, compute = true,
			marginTop =  parseFloat(getCurrentStyle(e, 'margin-top')) || 0,
			marginLeft =  parseFloat(getCurrentStyle(e, 'margin-left')) || 0,
			r = {};
		each(['offset', 'client', 'scroll'], function(v){
			r[v + 'Height'] = e[v + 'Height'];
			r[v + 'Width'] = e[v + 'Width'];
		});
		while(e != null){
			x += e.offsetLeft;
			y += e.offsetTop;
			e = e.offsetParent;
			if (compute && (e == null || getCurrentStyle(e, 'position') != 'static')) {
				compute = false;
				left = x - marginLeft;
				top = y - marginTop;
			}
		}
		return extend(r, {
			left : left,
			top : top,
			x : x,
			y : y
		});
	};
	var handleDrag = function(el, event, opts){
		var moveState = true;
		var target = opts.target;
		var parent = opts.parent;
		var range = opts.range;
		var scroll = getScrollOffsets();
		var startX = event.clientX + scroll.x;
		var startY = event.clientY + scroll.y;
		var origOffset = getOffset(target);
		var parentOffset = getOffset(parent);
		var origX = origOffset.x;
		var origY = origOffset.y;
		var computedStyle = getCurrentStyle(target);
		var origPosition = computedStyle.position;
		if (origPosition == 'static') {
			var targetStyle = target.style;
			targetStyle.position = 'absolute';
			targetStyle.left = 'auto';
			targetStyle.right = 'auto';
			targetStyle.top = 'auto';
			targetStyle.bottom = 'auto';
			computedStyle = getCurrentStyle(target);
		}
		var px;
		var origLeft = isNaN(px = parseFloat(computedStyle.left)) ? parseFloat(origOffset.left) : px;
		var origTop = isNaN(px = parseFloat(computedStyle.top)) ? parseFloat(origOffset.top) : px;
		var rangeMinLeft = parentOffset.x - origX + origLeft;
		var rangeMinTop =  parentOffset.y - origY + origTop;
		var rangeMaxLeft = rangeMinLeft + parentOffset.clientWidth - origOffset.clientWidth;
		var rangeMaxTop = rangeMinTop + parentOffset.clientHeight - origOffset.clientHeight;
		if (doc.addEventListener) {
			// true : 事件捕获模型， false : 事件冒泡模型
			addEvent(doc, 'mousemove', moveHandler, true);
			addEvent(doc, 'mouseup', upHandler, true);
		} else {
			// 持续捕获事件
			el.setCapture();
			addEvent(el, 'mousemove', moveHandler);
			addEvent(el, 'mouseup', upHandler);
			addEvent(el, 'losecapture', upHandler);
		}
		// stop bubble
		stopPropagation(event);
		// stop default action
		preventDefault(event);
		// handler function
		function moveHandler(e){
			if (moveState === false) {
				stopPropagation(e);
				preventDefault(event);
				return;
			}
			var p = computePosition(e);
			target.style.left = p.left + 'px';
			target.style.top = p.top + 'px';
			if (false === opts.moving(p)) {
				upHandler(e);
			}
			stopPropagation(e);
		}
		function upHandler(e){
			if (doc.addEventListener) {
				removeEvent(doc, 'mouseup', upHandler, true);
				removeEvent(doc, 'mousemove', moveHandler, true);
			} else {
				el.releaseCapture();
				removeEvent(el, 'losecapture', upHandler);
				removeEvent(el, 'mouseup', upHandler);
				removeEvent(el, 'mousemove', moveHandler);
			}
			moveState && opts.moved(computePosition(e));
			moveState = false;
			stopPropagation(e);
		}
		// 鼠标移动偏移量
		function getMousePosition(e){
			var scroll = getScrollOffsets();
			return {
				dragTarget : target,
				eventTarget : el,
				deltaX : e.clientX + scroll.x - startX,
				deltaY : e.clientY + scroll.y - startY,
				clientX : e.clientX,
				clientY : e.clientY
			};
		}
		// 计算元素的left和top
		function computePosition(e){
			var p = getMousePosition(e),
				left = origLeft + p.deltaX,
				top = origTop + p.deltaY;
			switch(range){
			case 'all' :
				left = left > rangeMaxLeft ? rangeMaxLeft : (left < rangeMinLeft ? rangeMinLeft : left);
				top = top > rangeMaxTop ? rangeMaxTop : (top < rangeMinTop ? rangeMinTop : top);
				break;
			case 'both' :
				left = left > rangeMaxLeft ? rangeMaxLeft : (left < rangeMinLeft ? rangeMinLeft : left); 
				break;
			case 'top' :
				top = top < rangeMinTop ? rangeMinTop : top;
				break;
			case 'bottom' :
				top = top > rangeMaxTop ? rangeMaxTop : top;
				break;
			case 'right' :
				left = left > rangeMaxLeft ? rangeMaxLeft : left;
				break;
			case 'left' :
				left = left < rangeMinLeft ? rangeMinLeft : left;
				break;
			case 'topLeft' :
				left = left < rangeMinLeft ? rangeMinLeft : left;
				top = top < rangeMinTop ? rangeMinTop : top;
				break;
			case 'topRight' :
				left = left > rangeMaxLeft ? rangeMaxLeft : left;
				top = top < rangeMinTop ? rangeMinTop : top;
				break;
			case 'topBottom' :
				top = top > rangeMaxTop ? rangeMaxTop : (top < rangeMinTop ? rangeMinTop : top);
				break;
			case 'bottomLeft' :
				left = left < rangeMinLeft ? rangeMinLeft : left;
				top = top > rangeMaxTop ? rangeMaxTop : top;
				break;
			case 'bottomRight' :
				left = left > rangeMaxLeft ? rangeMaxLeft : left;
				top = top > rangeMaxTop ? rangeMaxTop : top;
				break;
			default :
			}
			return extend({
				left: left,
				top: top
			}, p);
		}
		// call start fn
		opts.start(computePosition(event));
	};
	var initDrag = function(el, opts){
		var k = timeStamp + "_drag", t,
			handler = function(e){
				handleDrag(el, e, opts);
			};
		// only one event handler on the element
		if (el[k]) {
			drag.destory(el);
		}
		t = el[k] = new Date().getTime();
		el['drag_' + t] = handler;
		addEvent(el, 'mousedown', handler);
	};
	var drag = gui.drag = function(el, opts){
				if (el.length) {
					for (var i = 0, len = el.length; i < len; i++) {
						drag(el[i], opts);
					}
				} else if ('string' === typeof opts) {
					drag[opts](el);
				} else {
					initDrag(el, extend({
						target : el, // 目标元素
						parent : doc.body, // 父元素
						range : 'none', // 允许超出父窗口, 不允许超出时才需要计算父窗口位置, 'left', 'right', 'top', 'bottom','topLeft', 'topRight','topBottom','topLeft','bottomLeft','bottomRight','both','all','none'
						start : foo, // 点击开始
						moving : foo, // 移动回调
						moved : foo // 移动结束回调
					}, opts));
				}
			};
	extend(drag, {
		destory : function(el){
			var k = timeStamp + "_drag";
			if (el[k]) {
				removeEvent(el, 'mousedown', el['drag_' + el[k]]);
			}
			el['drag_' + el[k]] = undefined;
			el[k] = undefined;
			return el;
		}
	});
	// dialog, gui采用面向对象会比较简单
	gui.dialog = function(opts){
		if (!(this instanceof gui.dialog)) {
			return new gui.dialog(opts);
		}
		return this.init(opts);
		var el = opts.el, r;
		if ('string' === typeof el) {
			el = _id(el);
		}
		el = this.el = opts.el = el || function(){
			var e = doc.createElement('div');
			e.style.height = '100%';
			return e;
		}();
		if ((r = el['dialog_' + el[timeStamp + '_dialog']])) {
			return r;
		}
		this.init(opts);
	};
	gui.dialog.prototype = function(){
		var dialog_token = timeStamp + '_dialog';
		var defalutOpts = {
				range : 'none',
				el : null,
				parent: doc.body,
				type: 'dialog',
				title : '',
				resize : true,
				drag : true,
				width: 'auto',
				height : 'auto',
				modal : true,
				close : foo,
				maxable : true,
				max : foo,
				restore : foo,
				minable : true,
				min : foo,
				closeable : true,
				open : true,
				animation : false, // fade, slideTop slideLeft sildeBottom slideRight
				buttons : {},
				position: {point : []} // [x,y], ['center'] = ['auto'] = [], [bottom], [right], [left], [leftbottom], [rightbottom], [top] 
		};
		var initDialog = function(obj, opts){
			var el, r, origWidth, origHeight, wrap, innerDiv,dialog,trs,thead,tbody,
				tfoot,width,height,trCell,titleBar,titleCtrl,diaContent,mask,identify;
			opts = obj.opts = extend({},defalutOpts,opts);
			el = opts.el, r;
			if ('string' === typeof el) {
				el = _id(el);
			}
			el = obj.el = opts.el = el || function(){
				var e = doc.createElement('div');
				e.style.height = '100%';
				return e;
			}();
			if ((r = el['dialog_' + el[dialog_token]])) {
				return r;
			}
			obj.nextSibling = el.nextSibling;
			obj.parent = el.parentNode;
			obj.lastTop = 0;
			obj.lastLeft = 0;
			// assign the object to the element
			identify = el[dialog_token] = new Date().getTime();
			el['dialog_' + identify] = obj;
			origWidth = el.offsetWidth;
			origHeight = el.offsetHeight;
			wrap = obj.wrap = doc.createElement('div');
			opts.parent.appendChild(wrap);
			wrap.id = 'gui_dialog_' + identify;
			wrap.className = 'gui-dialog ' + (opts.drag ? 'gui-dialog-draggable ' : '') + (opts.resize ? 'gui-dialog-resizable  ' : '') + (opts.open ? 'gui-dialog-open ' : '');
			wrap.innerHTML = '<div class="gui-dialog-outer"><table class="gui-dialog-border"><tr><td class="gui_nw"></td><td class="gui_n"></td><td class="gui_ne"></td></tr><tr><td class="gui_w"></td><td class="gui_c"></td><td class="gui_e"></td></tr><tr><td class="gui_sw"></td><td class="gui_s"></td><td class="gui_se"></td></tr></table></div>';
			innerDiv = _.createElement('<div><table><tr>3');
			innerDiv.className = 'gui-dialog-inner';
			getElesByClass('gui_c', wrap)[0].appendChild(innerDiv);
			dialog = innerDiv.children[0];
			trs = dialog.getElementsByTagName('tr');
			thead = trs[0];
			tbody = trs[1];
			tfoot = trs[2];
			width = opts.width;
			height = opts.height;
			obj.curWidth = width = 'number' === typeof width ? width : (width.indexOf('%') > 0 ? opts.parent.clientWidth * parseFloat(width) / 100 - 20: (isNaN(parseFloat(width)) ? origWidth : parseFloat(width)));
			obj.curHeight = height = 'number' === typeof height ? height - 40 : (height.indexOf('%') > 0 ? opts.parent.clientHeight * parseFloat(height) / 100 - 40: (isNaN(parseFloat(height)) ? origHeight : parseFloat(height) - 40));
			// table is readonly in IE
			trCell = thead.insertCell(0); 
			trCell.innerHTML = '<td><div class="gui-dialog-titleBar"><div class="gui-dialog-title" title="' + opts.title + '"><p class="gui-dialog-title-con" style="width:' + Math.max((width - 100), 0) + 'px">' + opts.title + '</p></div><div class="gui-dialog-ctrls">' + (opts.minable ?  '<a class="gui-dialog-min fa fa-minus" title="最小化" href="javascript:void(0);"></a>' : '') + (opts.maxable ?  '<a class="gui-dialog-max fa fa-expand" title="最大化" href="javascript:void(0);"></a>' : '') + (opts.closeable ?  '<a class="gui-dialog-close fa fa-close" title="关闭" href="javascript:void(0);"></a>' : '') + '</div></div></td>';
			titleBar = getElesByClass('gui-dialog-title', trCell)[0];
			titleCtrl = getElesByClass('gui-dialog-ctrls', trCell);
			// body
			trCell = tbody.insertCell(0); 
			trCell.innerHTML = '<div class="gui-dialog-content state-full"></div><div class="gui-dialog-loading"></div>';
			opts.content != null ? (el.innerHTML = opts.content) : 0;
			diaContent = obj.diaContent = trCell.children[0];
			trCell.children[0].appendChild(el);
			trCell.className = 'gui-dialog-main';
			diaContent.style.height = height + 'px';
			diaContent.style.width = width + 'px';
			// foot
			trCell = tfoot.insertCell(0);
			trCell.innerHTML = '<div class="gui-dialog-btns"></div>';
			var i = 0, btns = opts.buttons, len = btns.length, btnsDiv = trCell.children[0], btn;
			if (len) {
				btnsDiv.style.display = 'block';
				for (; i < len; i++) {
					for (var text in btns[i]) {
						btn = doc.createElement('button');
						btn.innerHTML = text;
					}
				}
			}
			//mask
			mask = obj.mask =  doc.createElement('div');
			mask.id = 'gui_dialog_mask_' + identify;
			mask.className = 'gui-dialog-mask';
			wrap.parentNode.insertBefore(mask, wrap.nextSibling);
			bindEvent(obj, extend({
				titleBar : titleBar,
				titleCtrl : titleCtrl
			}, opts));
			// open right now?
			if (opts.open) {
				obj.open();
			}
			return obj;
		};
		var bindEvent = function(obj, opts){
			if (opts.drag) {
				drag(opts.titleBar, {
					target : obj.wrap,
					parent : opts.parent,
					range : opts.range,
					start : function(s){
						addClass(s.dragTarget, 'dragging');
						obj.el.style.display = 'none';
					},
					moved : function(s){
						removeClass(s.dragTarget, 'dragging');
						obj.el.style.display = 'block';
						obj.lastLeft = s.left;
						obj.lastTop = s.top;
					}
				});
			}
			// resize
			if (opts.resize) {
				var se = getElesByClass('gui_se, gui_s, gui_e, gui_n', obj.wrap),
					resizeWith = 0, 
					resizeHeight = 0,
					resizeTop,
					resizeLeft, 
					target,
					minWidth = 100,
					minHeight = 0,
					parentWidth = 0,
					parentHeight = 0,
					style = obj.diaContent.style,
					titleEle = getElesByClass('gui-dialog-title-con', obj.wrap)[0];
				drag(se, {
					start : function(s){
						parentWidth = opts.parent.clientWidth - 20;
						parentHeight = opts.parent.clientHeight - 50;
						addClass(s.eventTarget, 'resizing');
					},
					moving : function(s){
						 target = s.eventTarget;
						if (hasClass(target, 'gui_se')) {
							style.width = (resizeWith = Math.max(obj.curWidth + s.deltaX, minWidth)) + 'px';
							style.height = (resizeHeight = Math.max(obj.curHeight + s.deltaY, minHeight)) + 'px';
							titleEle.style.width = Math.max(resizeWith - minWidth, 0) + 'px';
						} else if (hasClass(target, 'gui_s')) {
							style.height = (resizeHeight = Math.max(obj.curHeight + s.deltaY, minHeight)) + 'px';
						} else if (hasClass(target, 'gui_e')) {
							style.width = (resizeWith = Math.max(obj.curWidth + s.deltaX, minWidth)) + 'px';
							titleEle.style.width = Math.max(resizeWith - minWidth, 0) + 'px';
						} else if (hasClass(target, 'gui_n')) {
							style.height = (resizeHeight = Math.max(obj.curHeight - s.deltaY, minHeight)) + 'px';
							obj.wrap.style.top = (resizeHeight == 0 ? resizeTop : (resizeTop = obj.lastTop + s.deltaY)) + 'px';
						}
						target.style.left = 'auto';
						target.style.top = 'auto';
					},
					moved : function(s){
						obj.curWidth = resizeWith;
						obj.curHeight = resizeHeight;
						obj.lastTop = resizeTop || obj.lastTop;
						obj.lastLeft = resizeLeft || obj.lastLeft;
						var style = s.eventTarget.style;
						style.position = '';
						style.top = '0';
						style.left = '0';
						removeClass(s.eventTarget, 'resizing');
						resizeTop = undefined;
						resizeLeft = undefined;
					}
				});
			}
			// window ctrls
			addEvent(opts.titleCtrl, 'click', function(e){
				var ele = e.target;
				if (hasClass(ele, 'gui-dialog-close') && opts.closeable) {
					obj.close();
				} else if (hasClass(ele, 'gui-dialog-min') && opts.minable) {
					obj.min();
				}
				if (hasClass(ele, 'gui-dialog-max') && opts.maxable) {
					obj.max();
				} else if (hasClass(ele, 'gui-dialog-restore') && opts.maxable) {
					obj.restore();
				}
				return false;
			});
		};
		return {
			init: function(opts){
				return initDialog(this, opts);
			},
			open : function(){
				var that = this;
				if (that.opts.modal) {
					that.mask.style.display = 'block';
				}
				that.wrap.style.display = 'block';
				addClass(that.wrap, 'gui-dialog-open');
				return that;
			},
			close : function(destory){
				var that = this;
				if (destory) {
					that.destory();
				} else {
					that.wrap.style.display = 'none';
					that.mask.style.display = 'none';
					removeClass(that.wrap, 'gui-dialog-open');
				}
				that.opts.close.apply(that.el);
				return that;
			},
			destory : function(){
				var that = this,
					next, parent;
				if ((next = that.nextSibling)) {
					that.parent.insertBefore(that.el, next);
				} else if ((parent = that.parent)) {
					parent.appendChild(that.el);
				}
				that.el['dialog_' + that.el[dialog_token]] = null;
				that.el[dialog_token] = null;
				removeEle(that.wrap);
				removeEle(that.mask);
				return that;
			},
			min : function(){
				var that = this;
				that.wrap.style.display = 'none';
				that.mask.style.display = 'none';
				removeClass(that.wrap, 'gui-dialog-open');
				that.opts.min.apply(that.el);
				return that;
			},
			restore : function(){
				var that = this,
					ele = getElesByClass('gui-dialog-restore', that.wrap),
					warpStyle = that.wrap.style,
					w = that.curWidth,
					h = that.curHeight,
					contentStyle = that.diaContent.style,
					titleEle = getElesByClass('gui-dialog-title-con', that.wrap)[0];
				warpStyle.position = 'absolute';
				warpStyle.left = that.lastLeft + 'px';
				warpStyle.top = that.lastTop + 'px';
				contentStyle.width = w + 'px';
				contentStyle.height = h + 'px';
				titleEle.style.width = Math.max((w - 100), 0) + 'px';
				// css change
				removeClass(ele, 'gui-dialog-restore fa-compress');
				addClass(ele, 'gui-dialog-max fa-expand');
				ele.title = '最大化';
				that.opts.restore.apply(that.el);
				return that;
			},
			max : function(){
				var that = this,
					ele = getElesByClass('gui-dialog-max', that.wrap),
					wrapStyle = that.wrap.style,
					contentStyle = that.diaContent.style,
					docEle = doc.documentElement,
					titleEle = getElesByClass('gui-dialog-title-con', that.wrap)[0];
				wrapStyle.position = 'fixed';
				wrapStyle.top = '0';
				wrapStyle.left = '0';
				var h = docEle.clientHeight,
					w = docEle.clientWidth;
				contentStyle.height = (h - 54) + 'px';
				contentStyle.width = (w - 20) + 'px';
				titleEle.style.width = Math.max((w - 100), 0) + 'px';
				// css chang
				removeClass(ele, 'gui-dialog-max fa-expand');
				addClass(ele, 'gui-dialog-restore fa-compress');
				ele[0].title = '还原';
				that.opts.max.apply(that.el);
				return that;
			},
			redraw : function(){
				
			},
			option : function(){
				
			}
		};
	}();
	var jsScroll = gui.jscroll = function(el, opts){
		var width,height,top,left,wrap,jsScroll,block; 
		opts = _.extend({
			width: 'atuo',
			height: 'auto',
			overflowX: 'auto',
			overflowY: 'auto'
		}, opts);
		if (el.length) {
			for (var i = 0, len = el.length; i < len; i++) {
				jsScroll(el[i]);
			}
		} else {
			width = el.offsetWidth;
			height = el.offsetHeiht;
			
		}
	};
}(window));