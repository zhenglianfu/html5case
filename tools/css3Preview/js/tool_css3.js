(function(){
    var menuClosed = true,
        $menu = $('.left-menu'),
        $contents = $('.content-wrap'),
        contentHeight = 0,
        contentScrollTop = 0;
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
    function scrollToContent(index){
        $contents.scrollTop(contentHeight * index);

    }
    function resizePanel(){
        var height = document.documentElement.clientHeight;
        contentHeight = height - $('.footer').height();
        $('.content-wrap, .content').height(contentHeight);
        // start point
        scrollToContent(0);
    }
    resizePanel();
    window.addEventListener('resize', resizePanel);
}());