(function(global){

	var arr_ = [1.1, 1.0, 0.9, 1.0, 1.1]
	var powtimer_;
	function _clear() {
	    $('#full').css("background", "none").empty();
	}
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
					.css("-webkit-transition", "all 1s ease-in")
					.css("-webkit-transform", "scale(3.0)")
					.css("-webkit-transform-origin", "50% 50%")
					.css("margin-left", i === 0 ? "10px" : (-70 * arr_[i]) +"px")
				.appendTo("#full")

			}
			setTimeout(function(){
				$("#full img").css("-webkit-transform", "scale(1.0)")
			}, 10)
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

	var MyGogogo = {};
	MyGogogo.go3 = showGogogo;
	MyGogogo.dot = showDot;

	global.MyGogogo = MyGogogo;
}(window));