var Record;

(function(global){
	Record = function(options){
		new EventEmitter().apply(this);

		this.src = (options && options.src) || "#manga"
		this.dest = (options && options.dest) || "#animation"

		this.w = (options && options.width)|| 640;
		this.h = (options && options.height)|| 480;

		this.contexts = [];
		this.canvass = [];

		this.count = 0;

		this.recording = false;
	}

	Record.prototype.start = function() {
		if(this.recording) {
			console.log("now recording....")
			return false;
		}

		var c = 10;

		Util.empty(document.querySelector(this.dest));

		this.contexts.length = 0;
		this.canvass.length = 0;
		this.recording = true;

		this.emit("start")

		var rec = function(){
			this.push();
			this.emit("pushed", c)

			c--;

			if(c > 0) {
				setTimeout(rec, 1000)
			} else {
				this.recording = false;
				this.emit("completed")
			}
		}.bind(this);

		rec();
	}

	Record.prototype.getContexts = function(){
		return this.contexts;
	}

	Record.prototype.push = function(){
		var canvas = document.createElement("canvas")
		canvas.style.display = "none";

		document.querySelector(this.dest).appendChild(canvas);
		canvas.width = this.w; 
		canvas.height = this.h; 

		var ctx = canvas.getContext('2d')

		ctx.drawImage(document.querySelector(this.src+" canvas"), 0, 0, this.w, this.h, 0, 0, this.w, this.h)

		this.contexts.push(ctx)
		this.canvass.push(canvas)
	}

	Record.prototype.check = function(){
		var count = 0;
		var check_ = function(){
			count = count % this.canvass.length
			for(var i = 0, l = this.canvass.length; i < l; i++){
				this.canvass[i].style.display = ( i === count ? "block" : "none")
			}
			count++;
		}.bind(this)
		setInterval(check_, 1000)
		
	}

}())