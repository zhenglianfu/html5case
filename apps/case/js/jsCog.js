// add modules
PManager.add([{
    zepto : {
        url : './zepto.min.js',
        module : '$',
        jsPath : true
    }
},{
    canvas2d : {
        url : ''
    }
},{
    engine : {
        url : '../apps/lib/engine.js',
        module : 'engine',
        jsPath : true
    }
},{
    touchEvent: {
        url : '',
        require : ['zepto']
    }
}]);