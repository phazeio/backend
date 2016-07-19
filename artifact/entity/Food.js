var Entity = require('./Entity');

/*
* @class Food
*/
function Food(gameServer, x, y, player) {
	var r;

	if(gameServer.config.protocolVersion === 5)
		r = gameServer.config.foodSize;
	else
		r = 0;

	Entity.call(this, gameServer, x, y, r);

	/*	food entity type is 0	*/
	this.entityType = 0;

	/*	player that spawned food on death	*/
	this.player = player;
}

Food.prototype.update = function() {
	if(this.radius < this.gameServer.config.foodSize)
		this.radius += 1;
	
	this.updated = Date.now();
}

module.exports = Food;