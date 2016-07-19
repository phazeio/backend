var key = '1234567890';
var createObjectID = (num) => {
	var str = '';
	for(var j = 0; j < num; j++)
		str += key[Math.floor(Math.random() * (key.length - 1))];

	return str;
}

/*
* @class Entity
*/
function Entity(gameServer, x, y, radius) {
	var _x = x ? x : gameServer.getSafeRandomCoord()
		, _y = y ? y : gameServer.getSafeRandomCoord();

	this.x = _x;
	this.y = _y;
	this.gameServer = gameServer;
	this._id 	= createObjectID(5);	
	this.radius = radius;
	this.color 	= gameServer.randomColor();
	this.entityType = 0;

	this.updated = Date.now();
}

module.exports = Entity;

/*	getters and setters	*/
Entity.prototype.getX = () => this.x;
Entity.prototype.getY = () => this.y;
Entity.prototype.get_id = () => this._id;
Entity.prototype.getRadius = () => this.radius;
Entity.prototype.getColor = () => this.color;
Entity.prototype.getEntityType = () => this.entityType;
Entity.prototype.getUpdated = () => this.updated;

Entity.prototype.setX = s => this.x = s;
Entity.prototype.setY = s => this.y = s;
Entity.prototype.setRadius = s => this.radius = s;
Entity.prototype.setColor = s => this.color = s;
Entity.prototype.setUpdated = s => this.updated = s;

