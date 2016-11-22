var MAX_POINTS = 80;
var carrier = null;

function Team(name, spawn) {
	this.name = name;
	this.spawn = spawn;

	this.points = 0;

	this.players = [];
}

var teams = [new Team('blue', {x: 100, y: 100}), new Team('red', {x: 200, y: 500})];

function getTeam(username) {
	for(var j = 0; j < teams.length; j++)
		for(var i = 0; i < teams[j].players; i++)
			if(teams[j].players[i].username === name)
				return teams[j];
}

module.exports = function(gameServer) {
	gameServer.PhazeEvent
		.on('player_spawn_event', (e) => {
			var p = e.getPlayer();

			// put them in a team
		})

		.on('player_death_event', e => {
			var p = e.getKiller()
				team = getTeam(p.username);

			team.points++;

			if(team.points === MAX_POINTS)
				// end game
		})

		.on('player_move_event', e => {
			var x = e.getX();
			var y = e.getY();


			// is this position inside the flag location for their team
		})
}