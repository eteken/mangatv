var Deco;

(function(global){
	Deco = function(options){
		new EventEmitter().apply(this);

		this.opts = {
			width: 640,
			height: 480,
			line_width: 4,
			line_color: "#f00",
			node: document.getElementById("animation")
		}
		for(var key in options){
			this.opts[key] = options[key];
		}

		this.canvas = document.createElement('canvas');
		this.canvas.width = this.opts.width;
		this.canvas.height = this.opts.height;

		this.opts.node.appendChild(this.canvas);
		this.canvas.style.position = "absolute";
		this.canvas.style.top = "0px";
		this.canvas.style.left = "0px";
		// this.canvas.style.background = "#f00"; /* debug */

		this.handler();
	}

	Deco.prototype.handler = function(){
		var drawing = false, prev = null;
		this.ctx = this.canvas.getContext('2d');
		this.ctx.lineWidth = this.opts.line_width;
		this.ctx.strokeStyle = this.opts.line_color;
		this.ctx.lineCap = "round";

		this.opts.node.addEventListener("mousedown", function(){
			drawing = true;
			prev = null;
		}, false)
		this.opts.node.addEventListener("mouseup", function(){
			drawing = false;
			prev = null;
		}, false)
		this.opts.node.addEventListener("mousemove", function(e){
			if(drawing){
				var x = e.layerX, y = e.layerY;
				if(!!prev) {
					this.ctx.moveTo(prev.x, prev.y)
					this.ctx.lineTo(x, y);
					this.ctx.stroke();
					prev = {x: x, y: y}
				} else {
					prev = {x: x, y: y}
				}
			}
		}.bind(this), false)
	}

	Deco.prototype.getContext = function(){
		return this.ctx;
	}

}(window))