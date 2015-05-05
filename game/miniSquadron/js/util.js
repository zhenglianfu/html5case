/**
 * function with dom
 * */
var browser = (function(bs){
    var agent = navigator.userAgent;
    for (var i = 0, len = bs.length; i < len; i++) {
        var b = bs[i],
            ms = agent.match(bs[i].regex);
        if (ms != null) {
            return {
                version : ms[1],
                name : b.name,
                prefix : b.prefix
            };
        }
    }
})([{regex : /chrome\/([\d\.]+)/i, prefix : 'webkit', name : 'Chrome'},
    {regex : /Firefox\/([\d\.]+)/i, prefix : 'moz', name : 'Firefox'},
    {regex : /Opera\/([\d\.]+)/i, prefix : 'o', name : 'Opera'},
    {regex : /Safari\/([\d\.]+)/i, prefix : 'webkit', name : 'Safari'}, // chrome first
    {regex : /MSIE ([\d\.]+)/i, prefix : 'ms', name : 'IE'}]);
var DomUtil = window.DomUtil || {},
    doc = document,
    root = document,
    head = doc.getElementsByTagName('head')[0];
_.extend(DomUtil, {
    head : head,
    body : doc.body,
    _id : function(id){
        if (id) {
            return doc.getElementById(id);
        } else {
            return root;
        }
    },
    select : function(cssQuery, parent){
        parent = parent || root;
        return parent.querySelectorAll(cssQuery || '');
    },
    hasClass : function(eles, className){

    },
    addClass : function(el, className){

    },
    removeClass : function(el, className){

    },
    is : function(){

    },
    css : function(){

    }
});