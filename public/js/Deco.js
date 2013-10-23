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
        revert: function(ctx, callback){
            if (this.cStep >= 0) {
                var canvasPic = new Image();
                canvasPic.src = this.cPushArray[this.cStep];
                canvasPic.addEventListener("load", function () {
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx.drawImage(canvasPic, 0, 0);
                    callback();
                }.bind(ctx, canvasPic, callback));
            }
        },
        undo: function(ctx){
            if (this.cStep > 0) {
                this.cStep--;
                var canvasPic = new Image();
                canvasPic.src = this.cPushArray[this.cStep];
                canvasPic.addEventListener("load", function () {
                    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
                    ctx.drawImage(canvasPic, 0, 0);
                }.bind(ctx, canvasPic));
                return this.cStep;
            }
            else return -1;
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
		var drawing = false, prev = null;
        this.currentStroke = [];
		this.ctx = this.canvas.getContext('2d');
		this.ctx.lineWidth = this.opts.line_width;
		this.ctx.strokeStyle = this.opts.line_color;
		this.ctx.lineCap = "round";
        this.undoManger = new UndoManager();
        this.undoManger.push(this.canvas.toDataURL());

        jQuery.fn.disabled = function(flag) {
            if (undefined == flag) {
                return undefined != jQuery(this).attr("disabled");
            }
            return this.each(function(){
                if (flag) {
                    if (undefined == jQuery(this).attr("disabled")) {
                        jQuery(this).attr("disabled", "disabled");
                    }
                } else {
                    if (undefined != jQuery(this).attr("disabled")) {
                        jQuery(this).removeAttr("disabled");
                    }
                }
            });
        };

        this.drawBeizer = function(){
            this.ctx.beginPath();
            var offset = Math.floor(this.currentStroke.length / 3) - 1;
            for(var i = 0; i < offset; i++){
                this.ctx.moveTo(this.currentStroke[i * 3].x, this.currentStroke[i * 3].y);
                this.ctx.bezierCurveTo(
                    this.currentStroke[i * 3 + 1].x,
                    this.currentStroke[i * 3 + 1].y,
                    this.currentStroke[i * 3 + 2].x,
                    this.currentStroke[i * 3 + 2].y,
                    this.currentStroke[i * 3 + 3].x,
                    this.currentStroke[i * 3 + 3].y);
                this.ctx.stroke();
            }
            for(var i = offset * 3; i < this.currentStroke.length; i++){
                this.ctx.moveTo(this.currentStroke[i].x, this.currentStroke[i].y);
                if(i + 1 < this.currentStroke.length) this.ctx.lineTo(this.currentStroke[i+1].x, this.currentStroke[i+1].y);
                else this.ctx.lineTo(this.currentStroke[i].x, this.currentStroke[i].y);
                this.ctx.stroke();
            }

        };

		this.opts.node.addEventListener("mousedown", function(){
			drawing = true;
			prev = null;
            this.currentStroke.splice(0, this.currentStroke.length);
        }.bind(this), false)
		this.opts.node.addEventListener("mouseup", function(){
			drawing = false;
			prev = null;
            this.undoManger.revert(this.ctx, function(){
                this.drawBeizer();
                this.undoManger.push(this.ctx.canvas.toDataURL());
            }.bind(this));
            jQuery($('#undo')).disabled(false);
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
                    this.currentStroke.push(prev);
				} else {
					prev = {x: x, y: y}
                    this.currentStroke.push(prev);
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
            jQuery($('#undo')).disabled(false);
        }.bind(this), false)
        this.opts.node.addEventListener("touchcancel", function(e){
            e.preventDefault();
            drawing = false;
            prev = null;
            this.undoManger.push(this.canvas.toDataURL());
            jQuery($('#undo')).disabled(false);
        }.bind(this), false)
        this.opts.node.addEventListener("touchleave", function(e){
            e.preventDefault();
            drawing = false;
            prev = null;
            this.undoManger.push(this.canvas.toDataURL());
            jQuery($('#undo')).disabled(false);
        }.bind(this), false)

        var self = this;
        $('#undo').on('click', function(){
            if(this.undoManger.undo(this.ctx) <= 0) jQuery($('#undo')).disabled(true);
        }.bind(this))

        if(this.ctx.strokeStyle !== "#ffffff"){
            jQuery($('#red')).disabled(true);
            jQuery($('#green')).disabled(false);
            jQuery($('#blue')).disabled(false);
            jQuery($('#black')).disabled(false);

            $('#red').on('click', function(){
                this.ctx.strokeStyle = "#ff0000";
                $('red').disabled("disabled", "disabled");
                jQuery($('#red')).disabled(true);
                jQuery($('#green')).disabled(false);
                jQuery($('#blue')).disabled(false);
                jQuery($('#black')).disabled(false);
            }.bind(this))
            $('#green').on('click', function(){
                this.ctx.strokeStyle = "#00ff00";
                jQuery($('#red')).disabled(false);
                jQuery($('#green')).disabled(true);
                jQuery($('#blue')).disabled(false);
                jQuery($('#black')).disabled(false);
            }.bind(this))
            $('#blue').on('click', function(){
                this.ctx.strokeStyle = "#0000ff";
                jQuery($('#red')).disabled(false);
                jQuery($('#green')).disabled(false);
                jQuery($('#blue')).disabled(true);
                jQuery($('#black')).disabled(false);
            }.bind(this))
            $('#black').on('click', function(){
                this.ctx.strokeStyle = "#000000";
                jQuery($('#red')).disabled(false);
                jQuery($('#green')).disabled(false);
                jQuery($('#blue')).disabled(false);
                jQuery($('#black')).disabled(true);
            }.bind(this))
        }
	}

	Deco.prototype.getContext = function(){
		return this.ctx;
	}

}(window))