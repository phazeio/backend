var Entity = require('./Entity')
	, Packet = require('../packet')
	, Food = require('./Food')
	, Power = require('./Power')
	, Shard = require('./Shard')
	, PhazeEvent = require('../Events');

/*
* @class Player
*/
function Player(gameServer, username, socket) {
	Entity.call(this, gameServer, null, null, gameServer.config.playerStartRadius);

	this.username = username;
	this.theta = 0;
	this.angle = 0;
	this.mana = 0;
	this.health = 100;
	this.damage = false;
	this.healing = false;
	this.mouse = {x: null, y: null};

	// when the player got power enhancer
	this.poweredAt = 0;

	this.socket = socket;
	this.visibleNodes = [];

	this.entityType = 2;

	this.joined = Date.now();
	this.kills = 0;

	this.combos = 0;
	this.lastDamage = 0;

	/* player performance rating	*/
	this.elo = this.gameServer.config.playerStartElo;
}

/*	getters and setters	*/
Player.prototype.getUsername = () => this.username;
Player.prototype.getAngle = () => this.angle;
Player.prototype.getMana = () => this.mana;
Player.prototype.getHealth = () => this.health;
Player.prototype.getElo = () => this.elo;

Player.prototype.setMana = s => this.mana = s;
Player.prototype.setHealth = s => this.health = s;
Player.prototype.setElo	= s => this.elo = s;

Player.prototype.addKills = n => this.kills += n;

/*	other methods	*/
Player.prototype.update = function() {
	this.move();
	if(this.gameServer.config.protocolVersion === 5)
		this.updateVisibleNodes();
	else
		this.calculateVisibileNodes();
	this.updated = Date.now();
	this.calculateConsumption();
}

Player.prototype.calculateAngle = function() {
	var dif = Math.abs(this.angle - this.theta);

	if (dif > Math.PI) {
		dif = (2 * Math.PI) - dif;
		this.theta += ((Math.abs(this.theta - this.angle) > Math.PI && this.angle < Math.PI) ? dif / 6 : -1 * dif / 6) + Math.PI * 2;
		this.theta %= Math.PI * 2;
	} else {
		this.theta += this.angle > this.theta ? dif / 10 : -1 * dif / 10;
	}

	return this.theta;
} 

Player.prototype.updateVisibleNodes = function() {
	var newVisibileNodes = [];

	for(var j = 0; j < this.gameServer.nodes.length; j++) {
		var n = this.gameServer.nodes[j];
		if(n.x > this.x - 1000 && n.x < this.x + 1000 && n.y > this.y - 1000 && n.y < this.y + 1000 && n._id !== this._id) {
			newVisibileNodes.push(n);

			// check for spawn nodes
			if(this.visibleNodes.indexOf(n) <= -1)
				// send spawn packet
				this.sendPacket((new Packet.SpawnNode(n)).build());
		}
	}

	var updateNodes = {players: [], nonPlayers: []};
	// find drop nodes
	for(var j = 0; j < this.visibleNodes.length; j++) {
		var node = this.visibleNodes[j];
		if(newVisibileNodes.indexOf(node) <= -1)
			// send drop packet
			this.sendPacket((new Packet.DropNode(node)).build());
		
		if(node.entityType > 1) {
			if(node.entityType === 2)
				updateNodes.players.push(node);
			else
				updateNodes.nonPlayers.push(node);

			// this.sendPacket(new Packet.UpdateNode(node).build());
		}
	}

	if(updateNodes.players.length !== 0 || updateNodes.nonPlayers.length !== 0)
		this.sendPacket((new Packet.UpdateNodesV2(updateNodes)).build());

	this.visibleNodes = newVisibileNodes;

}

Player.prototype.calculateVisibileNodes = function() {
	var newVisibileNodes = [];

	for(var j = 0; j < this.gameServer.nodes.length; j++) {
		var n = this.gameServer.nodes[j];
		if(n.x > this.x - 1000 && n.x < this.x + 1000 && n.y > this.y - 1000 && n.y < this.y + 1000 && n._id !== this._id)
			newVisibileNodes.push(n);
	}

	this.sendPacket((new Packet.UpdateNodes(newVisibileNodes).build()));

	this.visibleNodes = newVisibileNodes;
}

Player.prototype.calculateConsumption = function() {
	var newVisibileNodes = this.visibleNodes;

	for(var j = 0; j < newVisibileNodes.length; j++) {
		var entity = newVisibileNodes[j];

		if(!(entity instanceof Food || entity instanceof Power))
			continue;

		if(!this.gameServer.areOverlapping(this, entity))
			continue;

		if(entity.player && entity.player._id === this._id)
			continue;

		if(entity instanceof Food) {
			if(this.mana >= this.gameServer.config.playerMaxMana)
				continue;

			var food = new Food(this.gameServer);

			if(this.gameServer.nodesFood.length < this.gameServer.config.foodAmount) {
	        	this.gameServer.nodeHandler.addFood(food);
	        	this.eat();
	        }
		}

		if(entity instanceof Power) {
			var power = new Power(this.gameServer);

			this.poweredAt = Date.now();
		}

		this.gameServer.nodeHandler.removeNode(entity);
	

		this.eat();
	}
}

Player.prototype.eat = function() {
	// eat
	this.modMana(1);

	this.radius = this.gameServer.config.playerStartRadius + (0.15 * this.mana);

	// var r = this.gameServer.playerStartRadius + (0.2 * this.mana);
	// this.radius = r < this.gameServer.playerMaxRadius ? r : this.gameServer.playerMaxRadius;
}

Player.prototype.modMana = function(m) {
	this.mana += m;
}

/*
* move player
*/
Player.prototype.move = function() {
	var theta = this.calculateAngle();

	// if(this.y - this.radius < 0)
	// 	this.y = 0 + this.radius;

	// if(this.y + this.radius > this.gameServer.config.borderSize)
	// 	this.y = this.gameServer - this.radius;

	// if(this.x - this.radius < 0)
	// 	this.x = 0 + this.radius;

	// if(this.x + this.radius > this.gameServer.config.borderSize)
	// 	this.x = this.gameServer - this.radius;
	var speed = this.poweredAt > Date.now() - 1000 * 10 ? this.gameServer.config.playerSpeed * 1.5 : this.gameServer.config.playerSpeed;

	var y = this.y + speed * Math.sin(theta);
	if(y > 0 && y + this.radius * 2 < this.gameServer.config.borderSize)
		this.y += speed * Math.sin(theta);

	var x = this.x + speed * Math.cos(theta);
	if(x - this.radius > 0 && x + this.radius < this.gameServer.config.borderSize)
		this.x += speed * Math.cos(theta);

	this.sendPacket((new Packet.UpdatePosition(this)).build());
}

Player.prototype.shoot = function() {
	if(this.mana - 5 < 0)
		return;

	this.mana -= 5;

	var x = this.x + this.radius * Math.cos(this.angle);
    var y = this.y + this.radius * Math.sin(this.angle);

    this.radius = this.gameServer.config.playerStartRadius + (0.15 * this.mana);

    // bounce animation for player
    this.radius -= 2;
    setTimeout(() => {
    	this.radius += 4;
    	setTimeout(() => this.radius -= 2, 100);
    }, 100);


    this.gameServer.nodeHandler.addShard(new Shard(this.gameServer, x, y, this.angle, this));
}

/*
* inflict damage on player
*/
Player.prototype.inflictDamage = function(int, cause) {
	// var e = new Events.PlayerDamageEvent(this, cause.shooter, cause);
	// Events.emit('PlayerDamageEvent', e);

	// if(e.cancelled)
	// 	return;
	if(Date.now() - this.lastDamage < 800)
		this.combos++;
	else
		this.combos = 0;

	this.lastDamage = Date.now();

	this.health -= (int * (1 + this.combos));
	if(this.health <= 0) {

		var killer = cause.shooter;
		var newElo = this.gameServer.calcElo(killer.elo, this.elo);
		killer.elo += newElo;
		killer.kills += 1;
		killer.sendPacket((new Packet.Alert('You killed ' + this.username + ' +' + newElo)).build());

		return this.die();
	}

	this.damage = true;

	setTimeout(() => this.damage = false, 150);
}

Player.prototype.heal = function() {
	if(this.mana - 5 < 0)
		return;

	if(this.health >= 100)
		return;

	this.modMana(-5);

	this.health = this.health + 4 > 100 ? 100 : this.health + 4;
	this.healing = true;

	setTimeout(() => this.healing = false, 150);
}

/*
* kill player - do this somewhere else
*/
Player.prototype.die = function() {
	// something

	for(var j = 0; j < (this.mana / 2 < this.gameServer.config.playerMaxDrops ? this.mana / 2 : this.gameServer.config.playerMaxDrops); j++)
		this.gameServer.nodeHandler.addFood(new Food(this.gameServer, (Math.random() * (this.x + this.radius)) + (this.x - this.radius), (Math.random() * (this.y + this.radius)) + (this.y - this.radius), this))

	this.kick();
}

Player.prototype.kick = function() {
	this.sendPacket((new Packet.End()).build());
	this.gameServer.nodeHandler.removeNode(this);
}

Player.prototype.alert = function(alert) {
	this.sendPacket((new Packet.Alert(alert)).build());
}

// possible abstraction
Player.prototype.sendPacket = function(packet) {
	if(this.socket.readyState === 1)
		this.socket.send(packet, {binary: true});
}

module.exports = Player;