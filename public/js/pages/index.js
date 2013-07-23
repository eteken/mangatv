
var $v_ = $("video")
, $c_ = $("canvas")
, $i_ = $("img")
, ctx_ = $c_[0].getContext('2d')
, $t_ = $("textarea")
, effect = new myEffect(ctx_)
, mySpeech = new MySpeech();


var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);

// Streaming開始
navigator.webkitGetUserMedia({video: true, audio: false}, function(stream){
    var url = window.webkitURL.createObjectURL(stream);
    $v_[0].src = url;
    $v_[0].play();

})

$("#dark").val(effect.dark)
    .on("change", function(ev){
        effect.changeDark($(this).val());
    })
$("#blight").val(effect.blight)
    .on("change", function(ev){
        effect.changeBlight($(this).val());
    })
$("#pow").on("click", function(e){e.preventDefault();MyPow.pow();})
$("#go3").on("click", function(e){e.preventDefault();MyGogogo.go3();})
$("#dot").on("click", function(e){e.preventDefault();MyGogogo.dot();})

// Videoの再生が始まったら、JPEGの取得を開始する。
$v_.on("playing", function(){
    // canvas(不可視)のサイズをvideoサイズに変更
    var w = $(this)[0].videoWidth;
    var h = $(this)[0].videoHeight;

    $c_[0].width = w;
    $c_[0].height = h;
    $c_.css({"height": "100%"})

    var pos_ = $c_.position();
    var w_ = $c_.width();
    var h_ = $c_.height();

    $("#full").css({"left": pos_.left + "px", "top": 0, "width": w_, "height": h_})



    // ref http://www.slideshare.net/masayukimaekawa/java-script-14727253
    var doToon = function(){
        ctx_.drawImage($v_[0], 0, 0)


        var imgData = ctx_.getImageData(0, 0, w, h)
        var toon = effect.toon(imgData, w, h);

        ctx_.putImageData(toon, 0, 0)
        mySpeech.appendCanvas(ctx_, w, h)
        requestAnimationFrame(doToon)
        stats.update();
    }
    doToon()
})
