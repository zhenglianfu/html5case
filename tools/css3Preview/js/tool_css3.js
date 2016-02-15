(function(global){
    var menuClosed = true,
        $menu = $('.left-menu'),
        $contents = $('.content-wrap'),
        contentHeight = 0,
        contentScrollTop = 0,
        codePreWidth = 0,
        browsers = [{
            name: 'standard',
            icon: 'standard',
            prefix: ''
        },{
            name: 'chrome',
            icon: 'chrome',
            prefix: '-webkit-'
        },{
            name: 'safari',
            icon: 'safari',
            prefix: '-webkit-'
        },{
            name: 'firefox',
            icon: 'firefox',
            prefix: '-moz-'
        },{
            name: 'opera',
            icon: 'opera',
            prefix: '-o-'
        },{
            name: 'spartan',
            icon: 'ie',
            prefix: '-ms-'
        }];
    $menu.find('.expand').click(function(){
        if (menuClosed) {
            $menu.addClass('open');
        } else{
            $menu.removeClass('open');
        }
        menuClosed = !menuClosed;
    });
    $menu.on('click', 'li', function(){
        var name = $(this).attr('data-alias');
        $contents.find('.content').removeClass('active');
        $contents.find('.' + name).addClass('active');
        scrollToContent($contents.find('.' + name).index());
        $menu.find('li').removeClass('active');
        $(this).addClass('active');
    });
    $contents.bind('click', function(){
        if (menuClosed == false) {
            menuClosed = true;
            $menu.removeClass('open');
        }
        $('.footer').height('1em').find('.bottom-expand').removeClass('open');
        resizePanel();
    });
    $('.bottom-expand').click(function(){
        if ($(this).hasClass('open')) {
            $(this).removeClass('open');
            $('.footer').height('1em');
        } else {
            $(this).addClass('open');
            $('.footer').height('auto');
        }
        resizePanel();
    });
    function scrollToContent(index){
        $contents.scrollTop(contentHeight * index)
    }
    function resizePanel(){
        //// resize code width
        codePreWidth = $('.result').width() - 80;
        //$('.code').width(codePreWidth);
        global.codePreWidth = codePreWidth;
        var height = document.documentElement.clientHeight;
        contentHeight = height - $('.footer')[0].clientHeight;
        $('.content-wrap, .content').height(contentHeight);
        // scroll to
        // current point
        scrollToContent($('.ul-menu li.active').index() || 0);
    }
    resizePanel();
    window.addEventListener('resize', resizePanel);
    global.browsers = browsers;
    global.form2Obj = function form2Obj($content){
        var obj = {};
        $content = $($content);
        $content.find('input, select').each(function(){
            if (this.name && this.disabled !== true) {
                var curVal = obj[this.name];
                var name = this.name;
                var value = this.value;
                if (typeof curVal === 'undefined') {
                    obj[name] = value;
                } else if (typeof curVal === 'string') {
                    curVal = [curVal];
                    curVal.push(value);
                    obj[name] = curVal;
                } else {
                    obj[name].push(value);
                }
            }
        });
        return obj;
    }
}(window));
// TODO 动态加入五个浏览器的codeline