(function(global){
	//顔認識の開始
	var scale;
	var faceWidth = 0;
	var res;
	var canvas = $("canvas")[0]
	var ctx = canvas.getContext('2d')

	// 以下をtrueにすると、faceTrackingが行われるようになる。
	var faceDetection = location.hash == "#face"
	if(faceDetection){
		var htracker = new headtrackr.Tracker({calcAngles : true, ui : false, headPosition : false});
		htracker.init($("video")[0], $("canvas")[0]);
		htracker.start();


		document.addEventListener("facetrackingEvent", function( event ) {
		    // clear canvas
		    // once we have stable tracking, draw rectangle
		    if (event.detection == "CS") {
				scale = calc_scale();
		    	// showFaceSquare(event);
		    	res = event;
		      //showPow();
		    }
		});
	}

	function calc_scale(){

	  var video_width = $("video").css("width");
	  video_width = video_width.substring(0,video_width.length-2)-0;
	  var canvas_width = $("canvas").css("width");
	  canvas_width = canvas_width.substring(0,canvas_width.length-2)-0;

	  var scale = canvas_width / video_width;

	  return scale;
	}

	var faceWidth;

	function showFaceSquare(){
		if(res){
			faceWidth = res.width;
			ctx.beginPath();
			ctx.strokeStyle = "rgb(255, 255, 0)"
			ctx.strokeRect(res.x - (res.width >> 1), res.y - (res.height >> 1), res.width, res.height)
			ctx.stroke();

			var l_ = res.x - (res.width >> 1) + ($("#full").css("left").slice(0, -2)|0) + "px"
				, t_ = res.y - (res.height >> 1) + "px"
				, w_ = res.width + "px"
				, h_ = res.width + "px";
			$("#face").css({
				'left' : l_,
				'top' : t_,
				'width' : w_,
				'height' : h_
			})
		}
	}

	function showSpeech(str, color){
		if(!!str && res){
			var color_ = color || "#000"
			ctx.beginPath();
			ctx.strokeStyle = color_



			var margin_ = 50
				, dw_ = (parseInt(str.length / 10) + 1)
				, w_ = (dw_ * 40) + 10
				, h_ = (dw_ === 1 ? (str.length * 40 + 20) : 350);

			var x_, y_;

			ctx.stroke();
			ctx.fillStyle = "rgb(255, 255, 255)"

			if(res.x < (canvas.width >> 1)) {
				x_ = res.x + (res.width >> 1) + margin_
			} else {
				x_ = res.x - (res.width >> 1) - w_ - margin_
			}
			y_ = res.y - (res.width >> 1) + margin_;
			y_ = y_ < margin_ ? margin_ : y_;
			y_ = (canvas.height - y_) < 360 ? canvas.height - 360 : y_;

			if(true) {
				ctx.fillRect(x_ , y_, w_, h_)
				ctx.strokeRect(x_ , y_, w_, h_)
				ctx.stroke();
			}

			ctx.beginPath();
			ctx.fillStyle = color_
			ctx.textBaseLin = "top"
			ctx.font = "bold 30px 'Lucida Grande','Hiragino Maru Gothic ProN', '@ヒラギノ丸ゴ ProN W3','@Meiryo','@メイリオ',sans-serif";

			str = str.replace(/[ーー-]/g, "｜");

			for(var i = 0; str[i]; i++){
				var m_ = ctx.measureText(str[i])
				var dw_ = (i / 10) | 0;

				var x__ = x_ + w_ - 10 - m_.width - (dw_ * 40)
					,y__ = 40 + y_ + (30 * (i % 10))

				if(str[i].match(/[。．、]/g)) {
					x__ += 20
					y__ -= 18 
				}

				ctx.fillText(str[i], x__, y__ );
			}
			ctx.stroke();
			return true;
		} else {
			return false;
		}
	}


	var powtimer_ = null;

	function _clear() {

	    $('#full').css("background", "none").empty();
	}


	function showPow(){
		if(!!res){
			var faceWidth_ = res.width >> 1;
		} else {
			var faceWidth_ = 100
			var l_ = (canvas.width >> 1) - 50 + ($("#full").css("left").slice(0, -2)|0) + "px"
				, t_ = (canvas.height >> 1) - 50 + "px"
				, w_ = "100px"
				, h_ = "100px";
			$("#face").css({
				'left' : l_,
				'top' : t_,
				'width' : w_,
				'height' : h_
			})
		}

		if(!!ctx === false) {
			_clear();
		    if(!!powtimer_) {
		        clearTimeout(powtimer_)
		    }
		}
		$('#full').pow({
		    rays: 750,
		    probability: 0.25,
		    radius :faceWidth_,
		    originY:90,
		    originEl: ('#face'),
		    bgColorStart: 'rgba(255, 255, 255, 0)',
		    rayColorStart: 'rgba(0, 0, 0, 1)',
		    bgColorEnd: 'rgba(0, 0, 0, 0)',
		    rayColorEnd: 'rgba(0, 0, 0, 1)',
		    sizingRatio: 16,
		    ctx: ctx
		});
		if(!!ctx === false) {
		    powtimer_ = setTimeout(function(e){
		    	_clear();
		        powtimer_ = null;
		    }, 3000);
		}
	}

	global.MyPow = {};
	MyPow.pow = showPow;
	MyPow.showFaceSquare = showFaceSquare;
	MyPow.showSpeech = showSpeech;
}(window));