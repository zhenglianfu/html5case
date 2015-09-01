/**
 * Created by Administrator on 2015/9/1.
 */

/**
 * color string '#ffffff' or rgb(255,255,255)
 * return [r, g, b]
 * example: [255, 255, 255]
 * */
function parseColor(color){

}

/**
 * rgb -> hsl
 * r -> [0,255]
 * g -> [0,255]
 * b -> [0,255]
 * return [h, s, l]
 * */
function rgb2hsl(r, g, b){
    r /= 255; // belong to [0, 1]
    g /= 255;
    b /= 255;
    var max = Math.max(r, Math.max(g, b));
    var min = Math.min(r, Math.min(g ,b));
    var delta = max - min;
    var h = 0, s = 0, l = (max + min) / 2;
    // h
    if (max == min) {
        h = 0;
    } else if (max == r){
        h = g >= b ? 60 * (g - b) / delta : 60 * (g - b) / delta + 360
    } else if (max == g) {
        h = 60 * (b - r) / delta + 120;
    } else {
        h = 60 * (r - g) / delta + 240;
    }
    // s
    if (l == 0 || max == min) {
        s = 0;
    } else if (l > 0.5) {
        s = (max - min) / (2 - (min + max));
    } else {
        s = (max - min) / (min + max);
    }
    return [h, s, l];
}

/**
 * hsl -> rgb
 * h -> [0,360]
 * s -> [0,1]
 * l -> [0,1]
 * return [r, g, b]
 * */
function hsl2rgb(h, s, l){
    h /= 360;
    var r = 0, g = 0, b = 0, t_r, t_g = h, t_b, q, p, rgb = [];
    q = l < 0.5 ? l * (1 + s) : l + s - (l * s);
    p = 2 * l - q;
    t_r = h + (1 / 3);
    t_r = t_r > 1 ? t_r - 1 : t_r;
    t_b = h - (1 / 3);
    t_b = t_b < 0 ? t_b + 1 : t_b;
    [t_r, t_g, t_b].forEach(function(v){
        if (v < 1 / 6) {
            v = p + ((q - p) * 6 * v);
        } else if (v < 0.5) {
            v = q;
        } else if (v < 2 / 3) {
            v = p + ((q - p) * 6 * (2 / 3 - v));
        } else {
            v = p;
        }
        rgb.push(v * 255 | 0);
    });
    return rgb;
}
