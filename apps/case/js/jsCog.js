// add modules
PManager.add([{
    zepto : {
        url : '/javascript/zepto.min.js',
        module : '$'
    }
},{
    canvas2d : {
        url : ''
    }
},{
    engine : {
        url : '/apps/lib/engine.js'
    }
},{
    touchEvent: {
        url : '',
        require : ['zepto']
    }
}]);