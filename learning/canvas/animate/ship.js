/**
 * Created by Administrator on 2015/8/15.
 */
function Ship(color){
    this.x = 0;
    this.color = color;
    this.y = 0;
    this.width = 25;
    this.height = 20;
    this.rotation = 0;
    this.scale = 1;
    this.showFlame = false;
}

Ship.prototype = {
    draw: function(context){
        context.save();
        context.translate(this.x, this.y);
        context.rotate(this.rotation);
        context.lineWidth = 1;
        context.strokeStyle = this.color || '#000';
        context.beginPath();
        context.moveTo(10, 0);
        context.lineTo(-10, 10);
        context.lineTo(-5, 0);
        context.lineTo(-10, -10);
        context.lineTo(10, 0);
        context.stroke();
        if (this.showFlame) {
            context.beginPath();
            context.moveTo(-7.5, -5);
            context.lineTo(-15, 0);
            context.lineTo(-7.5, 5)
            context.stroke();
        }
        context.restore();
    }
};