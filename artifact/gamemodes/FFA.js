var Gamemode = require('./Gamemode');

function FFA(gameServer) {
	console.log(gameServer);
	Gamemode.call(gameServer);
	console.log('HI')
	this.gametype = 'FFA';

	gameServer.PhazeEvents
		// calculate points
		// drop them from server
		.on('player_death_event', function() {
			console.log('died!')
		})
}

FFA.prototype.init = function() {
	console.log('Initializing gamemode... FFA');
	// this.registerListeners();
}

// FFA.prototype.registerListeners = function() {
// 	this.gameServer.PhazeEvents
// 		// calculate points
// 		// drop them from server
// 		.on('player_death_event', function() {
// 			console.log('died!')
// 		})
// }

module.exports = FFA;