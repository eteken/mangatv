
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
;

var REC_TIME = 10000;

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

var AnimGifRecorder = function() {
    this.encoder = encoder = new GIFEncoder();
    encoder.setRepeat(0);
    encoder.setDelay(200);
    this.recording = false;
    this.canvas = canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    encoder.setSize(canvas.width, canvas.height);
    this.context = canvas.getContext('2d');
};
AnimGifRecorder.prototype = {
    start: function() {
        this.encoder.start();
        this.recording = true;
    },
    save: function() {
        var c = $c_[0];
        this.context.drawImage(c, 0, 0, c.width, c.height, 0, 0, this.canvas.width, this.canvas.height);
        this.encoder.addFrame(this.context);
    },
    finish: function() {
        this.encoder.finish();
        this.recording = false;
    },
    toDataURL: function() {
        return 'data:image/gif;base64,'+encode64(this.encoder.stream().getData());
    }
};
var animGifRecorder = new AnimGifRecorder();
var animGifTimmer;

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
                animGifTimmer = setTimeout(function() {
                    animGifRecorder.finish();
                    console.log('gif recording end');
                    location.href = animGifRecorder.toDataURL();
                }, REC_TIME);
            }
            animGifRecorder.save();
        }
        MyPow.showFaceSquare();
        // MyPow.showSpeech("テストテストaaaaaaaaaaaaaaaa")
        requestAnimationFrame(doToon)
//        stats.update();
    }
    doToon()
});

function animGifFinish() {
    captureAnim = false;
    animGifRecorder.finish();
    clearTimeout(animGifTimmer);
}

function animGifStart() {
    captureAnim = true;
}

$('#captureMovieButton').on('click', function(e) {
    animGifStart();
});

$('#rec .rec-start').on('click', function() {
    $('#rec').addClass('rec');
    animGifStart();
});
$('#rec .rec-stop').on('click', function() {
    $('#rec').removeClass('rec');
    animGifFinish();
});

