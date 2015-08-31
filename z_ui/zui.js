/**
 * Created by Administrator on 2015/8/26.
 * z_ui zui 最ui
 * zhenglianfu@github.com
 */
(function(){
    var _zui = window.z;
    var copys = {};
    var zui_uuid = 0;
    var zui = {
        layer: function(opts){
            var defaults = {
                content: "",
                type: "text",
                btns: [],
                cate: -1,
                mode: false
            };
            var index = zui_uuid++;
            copys[index];
            return index;
        },
        close: function(index){

        },
        alert: function(opt){

        },
        confirm: function(){

        }
    };
    window.z_ui = zui;
}());
