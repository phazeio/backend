function UpdateNodesV2(nodes) {
    this.players = nodes.players;
    this.nonPlayers = nodes.nonPlayers;
}

module.exports = UpdateNodesV2;

UpdateNodesV2.prototype.build = function() {
    var buf = new ArrayBuffer(2 + 11 * this.players.length + 6 * this.nonPlayers.length);
    var view = new DataView(buf);

    // console.log('nonPlayers: ' + this.nonPlayers.length);
    view.setUint8(0, 25);
    view.setUint8(1, this.players.length);

    for(var j = 0; j < this.players.length; j++) {
        var node = this.players[j];

        view.setUint16(j * 11 + 2, node._id); // nodeId
        view.setUint16(j * 11 + 4, node.x); // x
        view.setUint16(j * 11 + 6, node.y); // y
        view.setUint8(j * 11 + 8, node.radius); // radius
        view.setUint8(j * 11 + 9, node.health); // health
        view.setUint8(j * 11 + 10, node.damage ? 1 : 0); // damage
        view.setUint8(j * 11 + 11, node.healing ? 1 : 0); // healing
        // view.setUint8(j * 11 + 12, node.poweredAt > Date.now() - 1000 * 10 ? 1 : 0); // power
    }

    for(var j = 0; j < this.nonPlayers.length; j++) {
        var node = this.nonPlayers[j];

        view.setUint16(j * 6 + (11 * this.players.length) + 2, node._id); // nodeId
        view.setUint16(j * 6 + (11 * this.players.length) + 4, node.x); // x
        view.setUint16(j * 6 + (11 * this.players.length) + 6, node.y); // y
    }

    return buf;
}