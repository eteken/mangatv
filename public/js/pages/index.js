
var $v_ = $("video")
, $c_ = $("canvas")
, $i_ = $("img")
, ctx_ = $c_[0].getContext('2d')
, $t_ = $("textarea")
, effect = new myEffect(ctx_)
, mySpeech = new MySpeech()
, soundEffects = new SoundEffects($c_[0])
, canvasSaver = new CanvasSaver($c_[0])
, recognizedText
, saveCanvasNeeded
, filter_options = {"edge": true, "tone": true}
, captureAnim = false
, animGifRecorder = new AnimGifRecorder($c_[0])
, animGifBlob
, animGifTimer
;

var REC_TIME = 2000;

if(window.canvasSaver){
    canvasSaver.init(function(error, result) {
        if (error) {
            console.error(error);
        }
    });
}
/*
var stats = new Stats();
stats.domElement.style.position = 'absolute';
stats.domElement.style.top = '0px';
document.body.appendChild(stats.domElement);
*/
// Streaming開始
navigator.webkitGetUserMedia({video: true, audio: false}, function(stream){
    var url = window.webkitURL.createObjectURL(stream);
    $v_[0].src = url;
    $v_[0].play();
});

$("#dark").val(parseInt(effect.dark))
    .on("change", function(ev){
        effect.changeDark($(this).val());
    })
$("#bright").val(parseInt(effect.bright))
    .on("change", function(ev){
        effect.changeBright($(this).val());
    });

$("#pow").on("click", function(e){e.preventDefault();MyPow.pow();})
$("#go3").on("click", function(e){e.preventDefault();MyGogogo.go3();})
$("#dot").on("click", function(e){e.preventDefault();MyGogogo.dot();})

var soundCommand = null;
$('#soundCommandButton').on('click', function() {
    soundCommand = $('#command').val();
});
$("#saveCanvas").on("change", function(e) {
    saveCanvasNeeded = this.checked;
});

if(window.mySpeech){
    mySpeech.onRecognized = function(result) {
        console.log(result);
        recognizedText = result;
    };
}

$("form p.filter input").on("change", function(e){
    var id_ = $(this).attr("id")
    console.log(id_, $(this)[0].checked)
    filter_options[id_] = !!$(this)[0].checked
})
// Videoの再生が始まったら、JPEGの取得を開始する。
$v_.on("playing", function(){
    // canvas(不可視)のサイズをvideoサイズに変更
    var w = $(this)[0].videoWidth;
    var h = $(this)[0].videoHeight;

    $c_[0].width = w;
    $c_[0].height = h;
    $c_.css({"height": "100%"});

    var pos_ = $c_.position();
    var w_ = $c_.width();
    var h_ = $c_.height();

    effect.set(w,h);

    $("#full").css({"left": pos_.left + "px", "top": 0, "width": w_, "height": h_})



    // ref http://www.slideshare.net/masayukimaekawa/java-script-14727253
    var doToon = function(){
        ctx_.drawImage($v_[0], 0, 0)


        var imgData = ctx_.getImageData(0, 0, w, h)
        if(location.hash == "#slow") {
          var toon = effect.slowtoon(imgData, w, h, filter_options);
        } else {
          var toon = effect.toon(imgData, w, h, filter_options);
        }

        ctx_.putImageData(toon, 0, 0)
        mySpeech.appendCanvas(ctx_, w, h)
        if (saveCanvasNeeded && recognizedText) {
            canvasSaver.save(function(error, result) {
                if (error) {
                    console.log('failed to save file');
                } else {
                    console.log('saved!');
                }
            });
        }

        if (soundCommand) {
            soundEffects.command(soundCommand);
            setTimeout(function() {
                soundCommand = null;
            }, 3000);
        }
        recognizedText = null;
        soundEffects.draw();
        
        // GIFアニメの保存
        if (captureAnim) {
            if (!animGifRecorder.recording) {
                animGifRecorder.start();
                console.log('gif recording start');
                animGifTimer = setTimeout(function() {
                    animGifFinish();
                    animGifBlob = animGifRecorder.toBlob();
                    document.getElementById('anim-result').src = URL.createObjectURL(animGifBlob);
                }, REC_TIME);
            }
            animGifRecorder.save();
        }
        MyPow.showFaceSquare();
        requestAnimationFrame(doToon)
//        stats.update();
    }
    doToon()
});

function animGifFinish() {
    captureAnim = false;
    animGifRecorder.finish();
    clearTimeout(animGifTimer);
    $('#rec').removeClass('rec');
    console.log('gif recording end');
}

function animGifStart() {
    captureAnim = true;
}

var recCounterTimer;
function startRecCounter(ms) {
    var recConter = $('#rec-time');
    var last = new Date().getTime() + ms;

    recCounterTimer = setInterval(function(){
        var now = new Date().getTime();
        var rest = last - now;
        if( rest > 0 ){
            var min=Math.floor(rest/1000/60);
            var sec=Math.floor(rest/1000)-min*60;
            var mil=rest-Math.floor(rest/1000)*1000;
            str = sec;
            // チューニングしてintervalも1000から10に戻す
            // str = ("00"+sec.toString(10)).slice(-2) + "."
            //     + ("000"+mil.toString(10)).slice(-3).slice(0,3);
        } else {
            str = '00.000';
            clearInterval(recCounterTimer);
        }
        recConter.text(str);
    }, 1000);
}

function stopRecCounter(ms) {

}

$('#captureMovieButton').on('click', function(e) {
    animGifStart();
});

$('#rec .rec-start').on('click', function() {

    var startCounter = $('#rec-start-count'),
        timerCount = 3,
        timer;
    startCounter.text(timerCount).show();
    timer = setInterval(function(){
        timerCount--;
        if ( timerCount === 0 ) {
            clearInterval(timer);
            startCounter.hide();
            $('#rec').addClass('rec');
            animGifStart();
            startRecCounter(REC_TIME);
        } else {
            startCounter.text(timerCount);
        }
    }, 1000);
});
$('#rec .rec-stop').on('click', function() {
    $('#rec').removeClass('rec');
    animGifFinish();
});

$('#tweetButton').on('click', function(e) {
    var fileName = Date.now() + '.gif';
    var xhr = new XMLHttpRequest();
    xhr.open('post', '/agif/' + fileName, true);
//    xhr.setRequestHeader('Content-Type', 'image/gif');
//    xhr.setRequestHeader('Conten-Length', animGifBlob.size);
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4)  {
            return;
        }
        console.log('upload finished:' + xhr.responseText);
    };
    var formData = new FormData();
    formData.append('image', animGifBlob, fileName);
    xhr.send(formData);
//    xhr.send(animGifBlob);
    if (animGifBlob) {
        URL.revokeObjectURL(animGifBlob);
        animGifBlob = null;
    }
 });
