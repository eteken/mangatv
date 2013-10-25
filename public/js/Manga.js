var Manga, Stream;

/**
 * Videoの開始とか、getUserMediaなんかで、データオブジェクトのあたりをふがほげするモジュール
 */

(function(global){
	navigator.getUserMedia_ = navigator.getUserMedia
		|| navigator.webkitGetUserMedia 
		|| navigator.mozGetUserMedia
        || navigator.msGetUserMedia
        || null;

	var createObjectURL_ = window.URL.createObjectURL;

	if(!!navigator.getUserMedia_ === false) {
		alert('this broweser does not have getUserMedia')
		return false;
	}

	if(!! createObjectURL_ === false) {
		alert('thsi browser does not have createObjectURL')
		return false;
	}




	// Stream Class
	Stream = function(){
		new EventEmitter().apply(this);

		navigator.getUserMedia_({video: true}, function(stream){
			this.emit('stream', stream);
		}.bind(this));
	}


	// Manga class
	Manga = function(options){
		new EventEmitter().apply(this);
		
		this.selector = (options && options.selector) || "#manga";
		this.video = document.createElement('video');
		this.video.style.display = "none"
		document.querySelector(this.selector).appendChild(this.video);
	}

	Manga.prototype.start = function(stream){
		// create unvisible video element

		this.createVideo_(stream);

		this.video.addEventListener('playing', function(e){
			this.setupCanvas_();
			this.filter_();
		}.bind(this), false)
	}

	Manga.prototype.createVideo_ = function(stream){
		var url = createObjectURL_(stream)
		this.video.src = url;
        this.video.addEventListener('loadedmetadata', function(e){
		    this.video.play();
        }.bind(this));
	}
	Manga.prototype.setupCanvas_ = function(){
		this.w = this.video.videoWidth, this.h = this.video.videoHeight;

		this.canvas = document.createElement('canvas');
		document.querySelector(this.selector).appendChild(this.canvas)
		this.canvas.width = this.w; this.canvas.height = this.h;

		this.ctx = this.canvas.getContext('2d');
		this.img_toon = this.ctx.createImageData(this.w, this.h);
	}

	Manga.prototype.filter_ = function(){
		var draw_ = function(){
			this.ctx.drawImage(this.video, 0, 0, this.w, this.h);
			var imgData = this.ctx.getImageData(0, 0, this.w, this.h);
			var filter_options = {edge: true, tone: true}


	        var toon = doToon(imgData, this.img_toon, this.w, this.h, filter_options);


	        this.ctx.putImageData(toon, 0, 0)
			requestAnimationFrame(draw_);
		}.bind(this);

		draw_();

	}


	// マンガ化処理関数

	var doToon = function(img, img_toon, width, height, options){
        // edgeとtoneがfalseの時は何もしない
        if(!options.edge && !options.tone) return img;

        var dotList = img.data;

        var gray;
        var tmp;
        var a0, a1, a2, a3;
        var c, i;
        var p;
        var FILTER = 0xff00;
        var dark = options.dark || 86;
        var bright = options.dark || 171;

        var x, y, gra, dx_, dy_;
        for(var y = 1; y < height-1; y++){
            for(var x = 1; x < width-1; x++){

                c = y * width + x;

                i = c << 2;

                tmp = (c - width) << 2;
                a0 = (dotList[tmp] + dotList[tmp+1] + dotList[tmp + 2]) & FILTER;
                tmp = (c - 1) << 2;
                a1 = (dotList[tmp] + dotList[tmp+1] + dotList[tmp + 2]) & FILTER;
                tmp = (c + 1) << 2;
                a2 = (dotList[tmp] + dotList[tmp+1] + dotList[tmp + 2]) & FILTER;
                tmp = (c + width) << 2;
                a3 = (dotList[tmp] + dotList[tmp+1] + dotList[tmp + 2]) & FILTER;

                gray = (dotList[i] + dotList[i+1] + dotList[i + 2] );



                if((a0 + a1 + a2+ a3) < ((gray & FILTER) << 2)) {
                    if(options.edge) {
                        img_toon.data[i] = 0;
                        img_toon.data[i+1] = 0;
                        img_toon.data[i+2] = 0;
                    }
                } else {
                    if(options.tone) {
                        if( gray < dark ) {
                            gra = 0;
                        } else if( gray > bright ) {
                            gra = 255;
                        } else {
                            gra = 1;
                        }

                        //　スクリーントーン化
                        if( gra == 1 ) {
                            dx_ = (x & 0x03)
                            dy_ = (y & 0x03)


                            if( (!dx_ && !dy_) || (dx_ == 2) && (dy_ == 2)){
                                gra = 0;
                            } else {
                                gra = 255;
                            }
                        };
                    } else {
                        gra = 255;
                    }


                    //漫画生成
                    img_toon.data[i] = gra;
                    img_toon.data[i+1] = gra;
                    img_toon.data[i+2] = gra;
                }
                img_toon.data[i+3] = 0xff; //img.data[i + 3];
            }
        }
        return img_toon;
    }
}(window))