(function(global){
	//顔認識の開始
	var htracker = new headtrackr.Tracker({calcAngles : true, ui : false, headPosition : false});
	  htracker.init($("video")[0], $("canvas")[0]);
	  htracker.start();


	  document.addEventListener("facetrackingEvent", function( event ) {
	    // clear canvas
	    // once we have stable tracking, draw rectangle
	    if (event.detection == "CS") {
	      var scale = calc_scale();
	      showFaceSquare(event, scale);
	      //showPow();
	    }
	});

	function calc_scale(){

	  var video_width = $("video").css("width");
	  video_width = video_width.substring(0,video_width.length-2)-0;
	  var canvas_width = $("canvas").css("width");
	  canvas_width = canvas_width.substring(0,canvas_width.length-2)-0;

	  var scale = canvas_width / video_width;

	  return scale;
	}

	var faceWidth;
	function showFaceSquare(event, scale){
	    var offset = $("canvas").position().left;

	    faceWidth = event.width;

	  $("#face").css('left', (offset + scale*(event.x-event.width/2))+'px')
	  $("#face").css('top', scale*(event.y-event.height/2)+'px')
	  $("#face").css('width', scale*event.width+'px')
	  $("#face").css('height', scale*event.height+'px')
	  $("#face").css('-webkit-transform', 'rotate('+ (event.angle-1.57)*(57.3) + 'deg)')

	}

	var powtimer_ = null;

	function _clear() {

	    $('#full').css("background", "none").empty();
	}
	function showPow(){
		_clear();
	    if(!!powtimer_) {
	        clearTimeout(powtimer_)
	    }
	  $('#full').pow({
	    rays: 500,
	    probability: 0.25,
	    radius :faceWidth * 1.3,
	    originY:90,
	    originEl:'#face',
	    bgColorStart: 'rgba(255, 255, 255, 0)',
	    rayColorStart: 'rgba(0, 0, 0, 1)',
	    bgColorEnd: 'rgba(0, 0, 0, 0)',
	    rayColorEnd: 'rgba(0, 0, 0, 1)',
	    sizingRatio: 4
	  });
	    powtimer_ = setTimeout(function(e){
	    	_clear();
	        powtimer_ = null;
	    }, 3000);
	}
	var arr_ = [1.1, 1.0, 0.9, 1.0, 1.1]
	function showGogogo(){
		showText_("./img/go_line.png")
	}
	function showDot(){
		showText_("./img/dot_line.png")
	}
	function showText_(img) {
		_clear();
		if(!!powtimer_){
			clearTimeout(powtimer_)
		}

		arr_.shuffle();

		$("#full").empty().css("padding-top", 40 * arr_[0] * 2 + "px");
		var w_ = $("canvas").width() / 4.5;

		if(img.indexOf("go") > 0) {
			for(var i = 0, l = arr_.length; i < l; i++){
				var $el = $("<img>").attr("src", img)
					.css("width", w_ * arr_[i])
					.css("margin-left", i === 0 ? "10px" : (-70 * arr_[i]) +"px")


				.appendTo("#full")
			}
		} else {
			[1.5, 1.2].forEach(function(n){
				console.log(n);
				var n_ = w_ * n;
				console.log(n_);
				$("<img>").attr("src", img).css("width", n_).appendTo("#full")
			})
		}
	    powtimer_ = setTimeout(function(e){
	    	_clear();
	        powtimer_ = null;
	    }, 3000);
	}

	global.MyPow = {};
	MyPow.pow = showPow;
	MyPow.go3 = showGogogo;
	MyPow.dot = showDot;
}(window));