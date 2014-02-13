
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
, animGifRecorder = new AnimGifRecorder($c_[0], {delay: 800})
, animGifBlob
, animGifTimer
, contextPath = $('#contextPath').val()
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


    var recConter = $('#rec-time');
    var recEndTime;

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
            
            // 「流れる系」のエフェクトは、一回コマンドを呼び出して終わり
            if (soundCommand === 'zawa' || soundCommand === 'go') {
                soundCommand = null;
                
            // そうでない場合は、3秒間表示する
            } else {

                if ( soundCommand === 'don' || soundCommand === 'ban' ) {
                    MyPow.pow(ctx_);
                }

                setTimeout(function() {
                    soundCommand = null;
                }, 3000);
            }
        }
        recognizedText = null;
        soundEffects.draw();
        
        // GIFアニメの保存
        if (captureAnim) {
            if (!animGifRecorder.recording) {
                recEndTime = new Date().getTime() + REC_TIME;
                animGifRecorder.start();
                console.log('gif recording start');
                animGifRecorder.save();
            } else {
                var now = new Date().getTime();
                var rest = recEndTime - now;

                if ( rest > 0 ) {
                    recConter.text(timerFormat(rest));
                    animGifRecorder.save();
                } else {
                    animGifFinish();
                    animGifBlob = animGifRecorder.toBlob();
                    showPopup(URL.createObjectURL(animGifBlob));
                }
            }
        }
        MyPow.showFaceSquare();
        requestAnimationFrame(doToon)
//        stats.update();
    }
    doToon()
});

function showPopup(imgURL) {
    $('#twitterId').val('');
    $('#handleName').val('');
    $('#anim-result').attr('src', imgURL);
    $('#rec-result').fadeIn();
}

function animGifFinish() {
    captureAnim = false;
    animGifRecorder.finish();
    clearTimeout(animGifTimer);
    $('body').removeClass('rec');
    stopRecCounter();
    console.log('gif recording end');
}

function animGifStart() {
    captureAnim = true;
}

var recCounterTimer;
// function startRecCounter(ms) {
//     var recConter = $('#rec-time');
//     // var last = new Date().getTime() + ms;

//     var sec = Math.floor(ms/1000);
//     recConter.text(sec);
//     recCounterTimer = setInterval(function(){
//         // var now = new Date().getTime();
//         // var rest = last - now;
//         if ( sec > 0 ) {
//         // if( rest > 0 ){
//             // var min=Math.floor(rest/1000/60);
//             // var sec=Math.floor(rest/1000)-min*60;
//             // var mil=rest-Math.floor(rest/1000)*1000;
//             // str = ("00"+sec.toString(10)).slice(-2) + "."
//             //     + ("000"+mil.toString(10)).slice(-3).slice(0,3);
//             str = --sec;
//         } else {
//             // str = '00.000';
//             str = 0;
//             clearInterval(recCounterTimer);
//         }
//         recConter.text(str);
//     }, 1000);
// }

$('.command-buttons button').on('click', function(){
    soundCommand = $(this).attr('data-command');
});

function stopRecCounter() {
    clearInterval(recCounterTimer);
}

function timerFormat(ms) {
    var min = Math.floor(ms/1000/60);
    var sec = Math.floor(ms/1000)-min*60;
    var mil = ms-Math.floor(ms/1000)*1000;
    return  ("00"+sec.toString(10)).slice(-2) + "." + ("000"+mil.toString(10)).slice(-3).slice(0,3);
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
            $('body').addClass('rec');
            animGifStart();
            // startRecCounter(REC_TIME);
        } else {
            startCounter.text(timerCount);
        }
    }, 1000);
});
$('#rec .rec-stop').on('click', function() {
    $('body').removeClass('rec');
    animGifFinish();
});

$('#close-btn').on('click', function(){
    $('#rec-result').fadeOut();
});

$('#tweetButton').on('click', function(e) {
    var twitterId = $('#twitterId').val();
    var handleName = $('#handleName').val();
    if (!twitterId && !handleName) {
        alert('Twitter ID、もしくはハンドルネームが入力されていません。');
        return;
    }
    var movieId = String(Date.now());
    var fileName = movieId + '.gif';
    var xhr = new XMLHttpRequest();
    xhr.open('post', contextPath + '/upload/movies/' + fileName, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState !== 4)  {
            return;
        }
        console.log('upload finished:' + xhr.responseText);
    };
    var formData = new FormData();
    if (twitterId) {
        formData.append('actorTwitterId', twitterId);
    }
    if (handleName) {
        formData.append('actorName', handleName);
    }
    formData.append('movieId', movieId);
    formData.append('movie', animGifBlob, fileName);
    xhr.send(formData);
    var movieUrl = location.protocol + '//' + location.host + contextPath + '/movies/' + movieId;
    var windowUrl = 'https://twitter.com/intent/tweet?hashtags=html5j&via=html5j&text=';
    var actorId = twitterId ? '.@' + twitterId : handleName;
    var tweet = encodeURIComponent(actorId + ' さんに、マンガテレビに出演していただきました！ on デブサミ2014 ' + movieUrl);
    windowUrl += tweet;
    window.open(windowUrl, 'twitter', 'width=480,height=360');
    if (animGifBlob) {
        URL.revokeObjectURL(animGifBlob);
    }
    // setTimeout(function(){
    //     $('#rec-result').fadeOut();
    // }, 2000);
 });
