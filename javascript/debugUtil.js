/**
 * Created by Administrator on 2015/5/19.
 */
(function(){
    // use alert in mobile device
    var isMobile = function(){
        var ua = navigator.userAgent;
        return /mobile/i.test(ua);
    }();
    var console = window.console;
    var Debug = function(){
        // ie don't support console if you don't open developer tools(F12)
        if (isMobile || !console) {
            return function(obj){
                var type = typeof obj;
                if (type == 'obj') {
                    alert(JSON.stringify(obj));
                } else if (type == 'function') {
                    alert('[function object] name: ' + (obj.name || '[anonymous function]'));
                } else {
                    alert(obj);
                }
            };
        } else {
            return function(obj){
                console.log.apply(console, arguments);
            }
        }
    }();
}());
