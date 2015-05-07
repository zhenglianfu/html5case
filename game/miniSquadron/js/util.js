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
// canvas simple package API
var Canvas2D = function Canvas2D(canvas, opts){
    if (!(this instanceof Canvas2D)) {
        return new Canvas2D(canvas, opts);
    }
    this.canvas = canvas;
    this.cxt    = canvas.getContext('2d');
    this.opts = _.extend({
        width  : canvas.width,
        height : canvas.height
    }, opts);
    this.resize();
}
Canvas2D.prototype = {
    get2DContext : function(){
        return this.cxt;
    },
    resize : function() {
        this.width  = this.canvas.width = this.opts.width;
        this.height = this.canvas.height = this.opts.height;
        return this;
    },
    translate : function(x, y){
        this.ctx.translate(x, y);
        return this;
    },
    clearRect : function(x, y, w, h){
        this.ctx.clearRect(x, y, w, h);
        return this;
    },
    fill : function(color){
        if (color instanceof Gradient) {
            color = color.getInstance();
        }
        this.cxt.fillStyle = color;
        this.cxt.fill();
    },
    stroke : function(color){
        this.cxt.strokeStyle = color;
        this.cxt.stroke();
    },
    rect : function(x, y, w, h){
        this.cxt.beginPath();
        this.cxt.rect(x, y, w, h);
    },
    getGradient : function(sx, sy, ex, ey){
        return Gradient(this.cxt.createLinearGradient(sx, sy, ex, ey), 'linear', this.canvas);
    }
};
var Gradient = function Gradient(gradient, type, canvas){
    if (!(this instanceof  Gradient)) {
        return new Gradient(gradient, type, canvas);
    }
    this.instance = gradient;
    this.type     = type;
    this.parentCanvas = canvas;
};
Gradient.prototype = {
    addColorStop : function(num, color){
        this.instance.addColorStop(num, color);
        return this;
    },
    getGradient : function(){
        return this.instance;
    }
};
