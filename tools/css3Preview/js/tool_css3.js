(function(){
    var menuClosed = true,
        $menu = $('.left-menu'),
        $contents = $('.content-wrap');
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
        $contents.find('.content').removeClass('active')
        $contents.find('.' + name).addClass('active');

    });
}());