function End() {

}

module.exports = End;

End.prototype.build = function() {
	var buf = new ArrayBuffer(1);
	var view = new DataView(buf);

	view.setUint8(0, 90);
	view.setUint
	
	return buf;
}