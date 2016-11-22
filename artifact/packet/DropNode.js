function DropNode(node) {
	this.node = node;
}

module.exports = DropNode;

DropNode.prototype.build = function() {
	var buf = new ArrayBuffer(3);
	var view = new DataView(buf);

	view.setUint8(0, 30);
	view.setUint16(1, this.node._id);

	return buf;
}