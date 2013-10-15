var Merger;

(function(global){
	Merger = function(options){
		this.opts = {
			width: 640,
			height: 480
		}

		this.cvs = document.createElement("canvas");
		this.cvs.width = this.opts.width;
		this.cvs.height = this.opts.height;
		this.cvs.style.display = "none";

		document.querySelector("body").appendChild(this.cvs)
	}

	Merger.prototype.do = function(arr /* array of canvas context */) {
		var ctx =  this.cvs.getContext('2d')
		var sb = arr[0].getImageData(0, 0, this.opts.width, this.opts.height)
		for(var i = 1, l = arr.length; i < l; i++){
			var deco = arr[i].getImageData(0, 0, this.opts.width, this.opts.height)
			for(var d = 0, dl = sb.data.length; d < dl; d+=4){
				if(deco.data[d + 3] !== 0) {
					sb.data[d] = deco.data[d];
					sb.data[d + 1] = deco.data[d + 1];
					sb.data[d + 2] = deco.data[d + 2];
				}
			}
		}
		ctx.putImageData(sb, 0, 0);

		return ctx;
	}
}(window))