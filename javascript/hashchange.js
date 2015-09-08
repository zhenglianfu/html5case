/**
 * Created by Administrator on 2015/9/8.
 * location.hash changed, hash change router
 */
(function(){
    var location = window.location,
        originHash = location.hash, // origin hash
        hashCopy = originHash, // copy of hash, every time hash changed, it will be restored
        instance = null;
    // hashRouter there will be only one router
    function HashRouter(opts){
        if (instance !== null) {
            instace.option.apply(instance, arguments);
        } else {
            instance = new HashRouter(opts);
        }
        return instance;
    }
    HashRouter.prototype = {
        _init: function(){
            if (this._inited) {
                return this;
            } else {

            }
            this._inited = true;
        },
        option: function(){}
    };
}());

