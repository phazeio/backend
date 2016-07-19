var key 	= 'asdghjbnsdfyghjbnqwel134567890SCVBNMLIUYTRFG',
	id 		= generateId(10),
	os 		= require('os')
	process	= require('process');

function generateId(int) {
	var str = '';

	for(var j = 0; j < int; j++)
		str += key[Math.floor(Math.random() * key.length)];

	return str;
}

var process = require('process');

process.on('message', (m) => console.log(m))

// heyGirl();

// function heyGirl() {
// 	setTimeout(heyGirl, 1000);
// 	console.log(id + ' := cpu:' + os.loadavg() + '; mem:' + JSON.stringify(process.memoryUsage()));
// }