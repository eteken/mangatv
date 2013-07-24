(function(global){
	//顔認識の開始
	var scale;
	var faceWidth = 0;

	// 以下をtrueにすると、faceTrackingが行われるようになる。
	if(true){
	var htracker = new headtrackr.Tracker({calcAngles : true, ui : false, headPosition : false});
	  htracker.init($("video")[0], $("canvas")[0]);
	  htracker.start();


	  document.addEventListener("facetrackingEvent", function( event ) {
	    // clear canvas
	    // once we have stable tracking, draw rectangle
	    if (event.detection == "CS") {
			scale = calc_scale();
	    	showFaceSquare(event);
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
	function showFaceSquare(event){
	    var offset = $("canvas").position().left;

	    faceWidth = event.width;

	  $("#face").css('left', (offset + scale*(event.x-event.width/2))+'px')
	  $("#face").css('top', scale*(event.y-event.height/2)+'px')
	  $("#face").css('width', scale*event.width+'px')
	  $("#face").css('height', scale*event.height+'px')
	  $("#face").css('-webkit-transform', 'rotate('+ (event.angle-1.57)*(57.3) + 'deg)')

	  $("#face-orig").css('left', (event.x - event.width / 2)+'px')
	  $("#face-orig").css('top', (event.y - event.height / 2)+'px')
	  $("#face-orig").css('width', event.width+'px')
	  $("#face-orig").css('height', event.height+'px')
	  $("#face-orig").css('-webkit-transform', 'rotate('+ (event.angle-1.57)*(57.3) + 'deg)')

	}

	var powtimer_ = null;

	function _clear() {

	    $('#full').css("background", "none").empty();
	}

	if(true){
		faceWidth = 80;
		var l_ = (640  - faceWidth) / 2
			, t_ = (480 - faceWidth) / 2
			, w_ = faceWidth
			, h_ = faceWidth;
		$("#face,#face-orig").css({
			'left' : l_,
			'top' : t_,
			'width' : w_,
			'height' : h_
		})
	}
	function showPow(ctx){
		var faceWidth_;
		if(!!ctx) {
			var faceWidth_ = faceWidth;
		} else {
			var faceWidth_ = scale * faceWidth;
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
		    originEl: (!!ctx ? '#face-orig' : '#face'),
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
}(window));