/**
 * Created by Administrator on 2015/5/4.
 */

(function(){
    function Player(opts){
        if (!(this instanceof Player)) {
            return new Player(opts);
        }

    }
    Player.prototype = {
        speed : 10,
        cd : 1000,
        level : 0,
        hp : 100,
        explore : function(){

        },
        fly : function(){

        }
    };
    window.Player = Player;
}());