var Deco;

(function(global){
    UndoManager = function(){
        this.cPushArray = [];
        this.cStep = -1;
    }
    UndoManager.prototype = {
        push: function(dataURL){
            this.cStep++;
            if (this.cStep < this.cPushArray.length) { this.cPushArray.length = this.cStep; }
            this.cPushArray.push(dataURL);
        },
        undo: function(ctx){
            console.log("undo" + this.cStep);
            if (this.cStep > 0) {
                this.cStep--;
                var canvasPic = new Image();
                canvasPic.src = this.cPushArray[this.cStep];
                console.log(canvasPic.src);
                canvasPic.addEventListener("load", function () {
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx.drawImage(canvasPic, 0, 0);
                }.bind(ctx, canvasPic));
            }
        }
    }

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

        this.canvasRect = this.canvas.getBoundingClientRect();

		this.handler();
	}

	Deco.prototype.handler = function(){
        console.log("handler");
		var drawing = false, prev = null;
		this.ctx = this.canvas.getContext('2d');
		this.ctx.lineWidth = this.opts.line_width;
		this.ctx.strokeStyle = this.opts.line_color;
		this.ctx.lineCap = "round";
        this.undoManger = new UndoManager();

		this.opts.node.addEventListener("mousedown", function(){
			drawing = true;
			prev = null;
		}, false)
		this.opts.node.addEventListener("mouseup", function(){
			drawing = false;
			prev = null;
            this.undoManger.push(this.canvas.toDataURL());
		}.bind(this), false)
		this.opts.node.addEventListener("mousemove", function(e){
			if(drawing){
				var x = e.layerX, y = e.layerY;
				if(!!prev) {
                    this.ctx.beginPath();
					this.ctx.moveTo(prev.x, prev.y);
					this.ctx.lineTo(x, y);
					this.ctx.stroke();
					prev = {x: x, y: y}
				} else {
					prev = {x: x, y: y}
				}
			}
		}.bind(this), false)
        this.opts.node.addEventListener("touchstart", function(e){
            e.preventDefault();
            drawing = true;
            prev = null;
        }, false)
        this.opts.node.addEventListener("touchmove", function(e){
            e.preventDefault();
            var touches = e.touches;
            if(drawing){
                var x = touches[0].pageX - this.canvasRect.left;
                var y = touches[0].pageY - this.canvasRect.top;
                if(!!prev) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(prev.x, prev.y);
                    this.ctx.lineTo(x, y);
                    this.ctx.stroke();
                    prev = {x: x, y: y}
                } else {
                    prev = {x: x, y: y}
                }
            }
        }.bind(this), false)
        this.opts.node.addEventListener("touchend", function(e){
            e.preventDefault();
            drawing = false;
            prev = null;
            this.undoManger.push(this.canvas.toDataURL());
        }.bind(this), false)
        this.opts.node.addEventListener("touchcancel", function(e){
            e.preventDefault();
            drawing = false;
            prev = null;
            this.undoManger.push(this.canvas.toDataURL());
        }.bind(this), false)
        this.opts.node.addEventListener("touchleave", function(e){
            e.preventDefault();
            drawing = false;
            prev = null;
            this.undoManger.push(this.canvas.toDataURL());
        }.bind(this), false)

        var self = this;
        $('#undo').on('click', function(){
            this.undoManger.undo(this.ctx);
        }.bind(this))

        if(this.ctx.strokeStyle !== "#ffffff"){
            $('#red').on('click', function(){
                this.ctx.strokeStyle = "#ff0000";
            }.bind(this))
            $('#green').on('click', function(){
                this.ctx.strokeStyle = "#00ff00";
            }.bind(this))
            $('#blue').on('click', function(){
                this.ctx.strokeStyle = "#0000ff";
            }.bind(this))
            $('#black').on('click', function(){
                this.ctx.strokeStyle = "#000000";
            }.bind(this))
        }
	}

	Deco.prototype.getContext = function(){
		return this.ctx;
	}

}(window))