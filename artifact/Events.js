var EventEmitter = require('EventEmitter');

function PhazeEvent() {
	EventEmitter.call(this);
}

module.exports = () => new PhazeEvent();