var bubbleMap = {};
var fn = function(e){
    bubbleMap[e.type] = true;
    console.log(e.type);
};
for (var i in window) {
    if ( i.indexOf('on') === 0) {
        var name = i.slice(2);
        bubbleMap[name] = 0;
        document.body.addEventListener(name, fn);
    }
}
