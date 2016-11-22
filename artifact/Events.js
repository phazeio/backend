var EventEmitter = require('events')
	, Events = {};

function PhazeEvent() {
	EventEmitter.call(this);
}

module.exports = () => new PhazeEvent();

// Events.PlayerDamageEvent = 'PlayerDamageEvent';
// function PlayerDamageEvent(player, shooter, shard) {
// 	this.cancelled = false;
// 	this.player = player;
// 	this.shard = shard;
// 	this.shooter = shard.shooter;
// }

// module.exports.PlayerDamageEvent = PlayerDamageEvent;