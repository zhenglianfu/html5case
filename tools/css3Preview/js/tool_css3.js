(function(){
    var menuClosed = true,
        $menu = $('.left-menu'),
        $contents = $('.content-wrap'),
        contentHeight = 0,
        contentScrollTop = 0,
        codePreWidth = 0;
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
        $('.code').width(codePreWidth);

        var height = document.documentElement.clientHeight;
        contentHeight = height - $('.footer')[0].clientHeight;
        $('.content-wrap, .content').height(contentHeight);
        // start point
        scrollToContent(0);

    }
    resizePanel();
    window.addEventListener('resize', resizePanel);
}());
// TODO 动态加入五个浏览器的codeline