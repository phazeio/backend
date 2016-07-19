// var fork 		= require('child_process').fork;
// var children	= [];

// for(var j = 0; j < 10; j++) {
// 	var worker 	= fork('./script');
// 	children.push(worker);
// 	worker.send('swag!!');

// }

/*	modules	*/
var fs				= require('fs')
	os 				= require('os')
	fork 			= require('child_process').fork,
	redis			= require('redis'),
	client 			= redis.createClient(),
	mongoose 		= require('mongoose');

var Schema 			= mongoose.Schema,
	sub 			= redis.createClient();

var address 		= os.hostname();
console.log(address)
// os.networkInterfaces()['eth0'][0]['address'];

mongoose.connect('mongodb://localhost:27017/phaze', err => {
	if(err)
		return console.log(err);
})

/* object literal of workers, port => worker*/
var childs			= {};

var daemonSchema 	= ({
	/*	address of daemon	*/
	address: String,

	/*	region of machine	*/
	region: String,

	/*	number of apps daemone should run	*/
	apps: {
		type: Array,
		default: {
			gamemode: 1,
			maxPlayers: 80,
			port: 1501
		}
	},

	/*	if the server is active	*/
	online: Boolean
});

var Daemon 			= mongoose.model('Daemon', daemonSchema),
	/*	daemon info returned from mongo	*/
	daemonInfo;

/*
address:port => health check
address:port => players list
address:port => {mem, cpu}
*/

sub.subscribe('phaze:updates');
sub.subscribe('phaze:' + address);
sub.on('message', function(channel, message) {
	var args		= message.split(':');

	switch(channel) {
		case 'phaze:updates':
			// handle update
			// message == artifact endpoint
			break;
		case 'phaze:' + os.hostname():
			switch(args[0]) {
				case 'deploy':
					var options = {
						gamemode: args[1],
						maxPlayers: args[2],
						port: args[3]
					}

					childs[options.port] = new Worker(options);

					daemonInfo.apps.push({gamemode: options.gamemode, maxPlayers: options.maxPlayers});
					daemonInfo.save(err => {
						if(err)
							console.log(err);
					})
					break;
				default:
					// do somethin
					break;
			}
			break;
		// restart node channel
		// restart daemon channel
		default:
			// wtf
			break;
	}
});

Daemon.findOne({address: address}, (err, info) => {
	if(err)
		return console.log(err);

	/*	if there is already a document in mongo for this daemon	*/
	if(!info) {
		var daemon 	= new Daemon({
			address: address,
			online: true
		})

		// set global variable to info so it can be accessed later on w/out query
		daemonInfo 	= daemon;

		daemon.save(err => {
			if(err)
				return console.log(err);

			init(daemon.apps);
		})
	/*	if there isnt a document in mongo for this daemon	*/
	} else {
		// set global variable to info
		daemonInfo	= info;

		info.online = true;
		info.save(err => {
			if(err)
				return console.log(err);
		})

		init(info.apps);
	}

})

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
		var port 	= 3001 + j;

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

	client.hset('phaze:servers', address, options.port);
}

Worker.prototype.handleMessage = function(message) {

}


// hashset > phaze:machines : machineAddress := port
// hashset > phaze:heartbeats : machineAddress:port := timestamp
// hashset > phaze:players : machine:port := players



// list > phaze:regions : machines
// list > phaze:${machine} : ports
// hashset > phaze:players : machine:port := players (number)
// hashset > phaze:heartbeats : machine:port := timestamp (number)
// 