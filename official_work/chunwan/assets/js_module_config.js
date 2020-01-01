PManager.add([
             {'jquery': {
            	 	url: 'assets/jquery-1.9.1.min.js',
            	 	module: 'jQuery'
             	},
             	'zepto': {
             		url: 'assets/zepto/zepto.min.js',
             		module: 'Zepto'
             	}
             },
             {
            	 'mami_util': {
            		 url: 'assets/util.js',
            		 module: 'mami',
            		 require: ['zepto']
            	 }
             },
             {
            	 'mami_qiniu': {
            		 url: 'assets/qiniu.js',
            		 name_space: 'window.mami',
            		 module: 'Qiniu',
            		 require: ['mami_util']
            	 }
             },
             {
            	 'h5event': {
            		 url: 'assets/h5event.js',
            		 module: 'window',
            		 require: ['zepto']
            	 }
             },
             {
            	 'mami_webshare': {
            		 url: 'assets/webshare.js',
            		 module: 'mami',
            		 require: ['mami_util']
            	 }
             },
             {
            	 'exif': {
            		 url: 'assets/exif.js',
            		 module: 'EXIF'
            	 }
             },
             {
            	 'swiper': {
            		 url: 'assets/swiper.min.js',
            		 module: 'Swiper',
            		 require: ['zepto'],
            		 styleList: [{href: '/static/js/swiper/css/swiper.min.css'}]
            	 }
             },
             {
            	 'app_bridge': {
            		 url: 'assets/activityTemplate.js'
            	 }
             }]);
