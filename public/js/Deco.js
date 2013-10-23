var Deco;

(function(global){
    MyJQuery = function(){}
    MyJQuery.setEnabled = function(jqueryObj, flag){
        if (flag) {
            if (undefined != jQuery(jqueryObj).attr("disabled")) {
                jQuery(jqueryObj).removeAttr("disabled");
            }
        } else {
            if (undefined == jQuery(jqueryObj).attr("disabled")) {
                jQuery(jqueryObj).attr("disabled", "disabled");
            }
        }
    };

    DecoEvent = function(){
        this.observer = [];
        this.observeObj = document.getElementById("animation");
        MyJQuery.setEnabled($('#red'), false);
        MyJQuery.setEnabled($('#green'), true);
        MyJQuery.setEnabled($('#blue'), true);
        MyJQuery.setEnabled($('#black'), true);
    };
    DecoEvent.prototype = {
        setCanvasRect: function(rect){
            this.canvasRect = rect;
        },

        handler: function(){
            var drawing = false;

            //mouse
            this.observeObj.addEventListener("mousedown", function(){
                drawing = true;
                this.notifyObservers({"type":"start"});
            }.bind(this), false);
            this.observeObj.addEventListener("mouseup", function(){
                drawing = false;
                this.notifyObservers({"type":"end"});
                MyJQuery.setEnabled($('#undo'), true);
            }.bind(this), false);
            this.observeObj.addEventListener("mousemove", function(e){
                if(drawing){
                    this.notifyObservers({"type": "move", "x": e.layerX, "y": e.layerY});
                }
            }.bind(this), false);

            //touch UI
            this.observeObj.addEventListener("touchstart", function(e){
                e.preventDefault();
                drawing = true;
                this.notifyObservers({"type":"start"});
            }.bind(this), false)
            this.observeObj.addEventListener("touchend", function(e){
                e.preventDefault();
                drawing = false;
                this.notifyObservers({"type":"end"});
                MyJQuery.setEnabled($('#undo'), true);
            }.bind(this), false);
            this.observeObj.addEventListener("touchcancel", function(e){
                e.preventDefault();
                drawing = false;
                this.notifyObservers({"type":"end"});
                MyJQuery.setEnabled($('#undo'), true);
            }.bind(this), false);
            this.observeObj.addEventListener("touchleave", function(e){
                e.preventDefault();
                drawing = false;
                this.notifyObservers({"type":"end"});
                MyJQuery.setEnabled($('#undo'), true);
            }.bind(this), false);
            this.observeObj.addEventListener("touchmove", function(e){
                e.preventDefault();
                var touches = e.touches;
                if(drawing){
                    var x = touches[0].pageX - this.canvasRect.left;
                    var y = touches[0].pageY - this.canvasRect.top;
                    this.notifyObservers({"type": "move", "x": x, "y": y});
                }
            }.bind(this), false);

            //Button
            $('#red').on('click', function(){
                this.notifyObservers({"type": "setColor", "color": "#ff0000"});
                MyJQuery.setEnabled($('#red'), false);
                MyJQuery.setEnabled($('#green'), true);
                MyJQuery.setEnabled($('#blue'), true);
                MyJQuery.setEnabled($('#black'), true);
            }.bind(this));
            $('#green').on('click', function(){
                this.notifyObservers({"type": "setColor", "color": "#00ff00"});
                MyJQuery.setEnabled($('#red'), true);
                MyJQuery.setEnabled($('#green'), false);
                MyJQuery.setEnabled($('#blue'), true);
                MyJQuery.setEnabled($('#black'), true);
            }.bind(this));
            $('#blue').on('click', function(){
                this.notifyObservers({"type": "setColor", "color": "#0000ff"});
                MyJQuery.setEnabled($('#red'), true);
                MyJQuery.setEnabled($('#green'), true);
                MyJQuery.setEnabled($('#blue'), false);
                MyJQuery.setEnabled($('#black'), true);
            }.bind(this));
            $('#black').on('click', function(){
                this.notifyObservers({"type": "setColor", "color": "#000000"});
                MyJQuery.setEnabled($('#red'), true);
                MyJQuery.setEnabled($('#green'), true);
                MyJQuery.setEnabled($('#blue'), true);
                MyJQuery.setEnabled($('#black'), false);
            }.bind(this));
            $('#undo').on('click', function(){
                this.notifyObservers({"type": "undo"});
            }.bind(this))
        },

        //observer pattern
        addObserver: function(observerItem){
            this.observer.push(observerItem);
        },
        notifyObservers:  function(jsonValue){
            this.observer.forEach(function(observerItem){
                observerItem(jsonValue);
            });
        }
    };

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

        this.prev = null;

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

        this.currentStroke = [];
        this.ctx = this.canvas.getContext('2d');
        this.ctx.lineWidth = this.opts.line_width;
        this.ctx.strokeStyle = this.opts.line_color;
        this.ctx.lineCap = "round";
        this.undoManger = new UndoManager();
        this.undoManger.push(this.canvas.toDataURL());
    };

    Deco.prototype = {
        drawBeizer: function(){
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
        },

        setColor: function(color){
            if(this.ctx.strokeStyle != "#ffffff") this.ctx.strokeStyle = color;
        },

        getContext: function(){
            return this.ctx;
        },

        getCanvasRect: function(){
            return this.canvas.getBoundingClientRect();
        },

        startDrawing: function(){
            this.prev = null;
            this.currentStroke.splice(0, this.currentStroke.length);
        },

        drawing: function(x, y){
            if(!!this.prev) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.prev.x, this.prev.y);
                this.ctx.lineTo(x, y);
                this.ctx.stroke();
                this.prev = {x: x, y: y};
                this.currentStroke.push(this.prev);
            } else {
                this.prev = {x: x, y: y};
                this.currentStroke.push(this.prev);
            }
        },

        endDrawing: function(){
            this.undoManger.revert(this.ctx, function(){
                this.drawBeizer();
                this.undoManger.push(this.ctx.canvas.toDataURL());
            }.bind(this));
        },

        undo: function(){
            if(this.undoManger.undo(this.ctx) <= 0) MyJQuery.setEnabled($('#undo'), false);
        },

        notify: function(){
            return function(json){
                if(json.type === "start") this.startDrawing();
                else if(json.type === "end") this.endDrawing();
                else if(json.type === "move") this.drawing(json.x, json.y);
                else if(json.type === "setColor") this.setColor(json.color);
                else if(json.type === "undo") this.undo();
            }.bind(this);
        }
    };
}(window));
