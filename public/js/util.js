var Util = {}

Util.empty = function(node) {
	while (node.hasChildNodes()) {
	    node.removeChild(node.lastChild);
	}
}
