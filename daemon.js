// var fork 		= require('child_process').fork;
// var children	= [];

// for(var j = 0; j < 10; j++) {
// 	var worker 	= fork('./script');
// 	children.push(worker);
 	// worker.send('swag!!');

// }

/*	modules	*/
var fs				= require('fs')
	os 				= require('os')
	fork 			= require('child_process').fork;

var address;
if(os.networkInterfaces()['eth0'] && os.networkInterfaces()['eth0'][0])
		address = os.networkInterfaces()['eth0'][0]['address'];
else
	address = '127.0.0.1';

/* object literal of workers, port => worker*/
var childs			= {};

var apps = [
	{
		maxPlayers: 80,
		gamemode: 1,
		address: address
	}
]

/* launch initial game server */
function init(apps) {
	var artifact,
		gameServer;

	try {
		artifact	= fs.lstatSync(__dirname + '/artifact');
	} catch(err) {
		// download artifact directory
		return console.log('no artifact directery')
	}

	if(!artifact.isDirectory()) {
		// some weird shit going on, download artifact directory
		return console.log('artifact is not a directory?');
	}

	try {
		gameServer	= fs.lstatSync(__dirname + '/artifact/GameServer.js');
	} catch(err) {
		// download artifact directory
		return console.log('no gameServer file?')
	}

	if(!gameServer.isFile())
		// no game server file in artifact folder?
		return console.log('game server is not a fiel?')



	/*	spawn child PHAZE children <3	*/
	for(var j = 0; j < apps.length; j++) {
		var port 	= 1500 + j;

		apps[j]['port'] = port;

		/*	store reference to worker 	*/
		childs[port]= new Worker(apps[j]);
	}
}

/*
* @class Worker
* @param options Object

* 	- port Number *port for game server*
*	- maxPlayers Number *max amount of players for gameserver*
*	- gamemode	Number *gamemode type for server*
*/
function Worker(options) {
	this.port		= options.port;
	this.maxPlayers = options.maxPlayers;
	this.gamemode 	= options.gamemode;
	this.address 	= options.address;

	/*	create new fork of the game GameServer 	*/
	this.worker 	= fork('./artifact/GameServer');

	/*	send options to worker c: 	*/
	this.worker.send('options\b' + JSON.stringify(options));
}

Worker.prototype.handleMessage = function(message) {

}

init(apps);


// hashset > phaze:machines : machineAddress := port
// hashset > phaze:heartbeats : machineAddress:port := timestamp
// hashset > phaze:players : machine:port := players



// list > phaze:regions : machines
// list > phaze:${machine} : ports
// hashset > phaze:players : machine:port := players (number)
// hashset > phaze:heartbeats : machine:port := timestamp (number)
// 
