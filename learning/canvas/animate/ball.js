
/**
 * Created by zhenglianfu on 2015/7/29.
 */

function Ball(radius, color){
    if (radius === undefined) {
        radius= 40;
    }
    if (color == undefined) {
        color = '#34a0fe';
    }
    this.x = 0;
    this.y = 0;
    this.scaleX = 1;
    this.scaleY = 1;
    this.ratation = 0;
    this.radius = radius;
    this.color = util.parseColor(color);
    this.color = "rgb(" + this.color[0] + "," + this.color[1] + "," + this.color[2] + ")"
    this.lineWidth = 1;
}
/**
 * @param {CanvasRenderingContext2D}
 * */
Ball.prototype.draw = function(context){
    context.save();
    context.translate(this.x, this.y);
    context.rotate(this.ratation);
    context.scale(this.scaleX, this.scaleY);
    context.lineWidth = this.lineWidth;
    context.fillStyle = this.color;
    context.beginPath();
    context.arc(0,0,this.radius,0, Math.PI * 2, true);
    context.closePath();
    context.fill();
    if (this.lineWidth > 0) {
        context.stroke();
    }
    context.restore();
}