var Entity = require('./Entity');

/*
* @class Power
*/
function Power(gameServer, x, y) {
	var r = gameServer.config.powerSize;

	Entity.call(this, gameServer, x, y, r);

	this.color = {
		r: 255,
		g: 255,
		b: 255
	}

	/*	food entity type is 0	*/
	this.entityType = 3;

	/*	player that spawned food on death	*/
	this.player = player;
}

Power.prototype.update = function() {
	if(this.radius < this.gameServer.config.foodSize)
		this.radius += 1;
	
	this.updated = Date.now();
}

Power.prototype.getPlayer = () => this.player;

module.exports = Power;