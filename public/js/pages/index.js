var myEffect;

(function(){
    myEffect = function(ctx, option){
        if(!!ctx === false) return false;
        if(!(this instanceof myEffect)) return new myEffect(ctx);

        // Definition of constant.
        option = option || {};
        this.TONE = 86; // 階調
        this.blight = localStorage.blight || option.blight || 2.3; // 明るさ
        this.dark = localStorage.dark || option.dark || 57; // 暗さの境界値

        this.ctx = ctx; // canvas context object
    }

    myEffect.prototype.changeBlight = function(num){
        num = parseInt(num);
        num = num < 0 ? 0 : num;
        num = num > 255 ? 255 : num;
        this.blight = num;
        localStorage.blight = this.blight;
    }

    myEffect.prototype.changeDark = function(num){
        num = parseInt(num);
        num = num < 0 ? 0 : num;
        num = num > 255 ? 255 : num;
        this.dark = num;
        localStorage.dark = this.dark;
    }

    myEffect.prototype.detect_edge = function(img, width, height){
        var data_quant = [];
        for(var i = 0; i < img.data.length; i+=4){
            var r = img.data[i]&0xFF;
            var g = img.data[i+1]&0xFF;
            var b = img.data[i+2]&0xFF;
            var gray = (r+g+b)/3;
            data_quant.push(gray & 0xC0);
        }

        var img_edge = this.ctx.createImageData(width, height);
        for(var y = 1; y < height-1; y++){
            for(var x = 1; x < width-1; x++){
                var i = y*width + x;
                var around = (data_quant[i-width]+data_quant[i-1]+data_quant[i+1]+data_quant[i+width])/4;

                if(around < data_quant[i]) var c = 0;
                else var c = 255;
                img_edge.data[i*4] = c;
                img_edge.data[i*4+1] = c;
                img_edge.data[i*4+2] = c;
                img_edge.data[i*4+3] = 255;
            }
        }
        return img_edge;
    };

    myEffect.prototype.toon = function(img, width, height){
        var dotList = img.data;
        var edge = this.detect_edge(img, width, height)

        var img_toon = this.ctx.createImageData(width, height)

        for(var i = 0, l = dotList.length; i < l; i+=4){
            var r = dotList[i]
            , g = dotList[i+1]
            , b = dotList[i+2]
            , gray = (r + g + b) / 3;

            // 明瞭化処理
            if(gray > this.dark) {
                gray = gray * this.blight;
                gray = (gray > 255) ? 255 : gray;
            }
            //階調化
            var gra = parseInt(gray / this.TONE);

            // 白色化
            gra = (gra === 2) ? 255  : gra;

            //　スクリーントーン化 
            if( gra === 1 ) {
                var dx = (i % (width * 4)) / 4;
                var dy = parseInt(i / (width * 4));
                var dx_ = dx % 4;
                var dy_ = dy % 4;

                if( dx_ === 0 && dy_ === 0) {
                    gra = 0;
                } else if(dx_ === 2 && dy_ === 2){
                    gra = 0;
                } else {
                    gra = 255;
                }
            };

            //エッジ追加
            img_toon.data[i] = edge.data[i] !== 0 ? gra : edge.data[i];
            img_toon.data[i + 1] = edge.data[i + 1] !== 0 ? gra : edge.data[i + 1];
            img_toon.data[i + 2] = edge.data[i + 2] !== 0 ? gra : edge.data[i + 2];
            img_toon.data[i + 3] = edge.data[i] !== 0 ? img.data[i + 3] : edge.data[i + 3];
        }
        return img_toon;
    }
}());

(function() {
    var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
        window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
    window.requestAnimationFrame = requestAnimationFrame;
}());

var $v_ = $("video")
, $c_ = $("canvas")
, $i_ = $("img")
, ctx_ = $c_[0].getContext('2d')
, $t_ = $("textarea")
, effect = new myEffect(ctx_)


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

//顔認識の開始
/*
  var htracker = new headtrackr.Tracker({calcAngles : true, ui : false, headPosition : false});
  htracker.init($v_[0], $c_[0]);
  htracker.start();
*/
$("#dark").val(effect.dark)
    .on("change", function(ev){
        effect.changeDark($(this).val());
    })
$("#blight").val(effect.blight)
    .on("change", function(ev){
        effect.changeBlight($(this).val());
    })

// Videoの再生が始まったら、JPEGの取得を開始する。
$v_.on("playing", function(){
    // canvas(不可視)のサイズをvideoサイズに変更
    var w = $(this)[0].videoWidth;
    var h = $(this)[0].videoHeight;

    $c_[0].width = w;
    $c_[0].height = h;
    $c_.css({"width": "100%"})



    // 1秒おきに画像に変更
    // ref http://www.slideshare.net/masayukimaekawa/java-script-14727253
    var doToon = function(){
        ctx_.drawImage($v_[0], 0, 0)


        var imgData = ctx_.getImageData(0, 0, w, h)
        var toon = effect.toon(imgData, w, h);

        ctx_.putImageData(toon, 0, 0)
        requestAnimationFrame(doToon)
        stats.update();

        // canvas内の画像を JPEG のデータURLに変換する
        // var dataURL = $c_[0].toDataURL('image/jpeg')

        // // img出力および文字列出力
        // $i_.attr("src", dataURL)
        // $t_.text(dataURL)
    }
    doToon()
})
/*
  document.addEventListener("facetrackingEvent", function( event ) {
  // clear canvas
  // once we have stable tracking, draw rectangle
  if (event.detection == "CS") {
  if(event.x < $c_[0].width / 2.0){// 画面の左側に顔がある場合右側に吹き出しを出せる。
  console.log('left');
  var x = event.x + event.width;
  var y = 0;
  var width = $c_[0].width - event.width - event.x;
  var height = $c_[0].height;
  //console.log('rect left: %d top: %d width: %d height: %d', x, y, width, height);
  } else{// 画面の右側に顔がある場合左側に吹き出しを出せる。
  console.log('right');
  var x = 0;
  var y = 0;
  var width = event.x;
  var height = $c_[0].height;
  //console.log('rect left: %d top: %d width: %d height: %d', x, y, width, height);
  }
  }
  });
*/

$(function() {
    var zapper = new Zapper({
        from: 1, // PCからの利用
        serverUrl: 'http://zapper.kakkoii.tv:80'
        //serverUrl: 'http://localhost:3001'
    })
    , currentEvent
//    , zaps = []
//    , messages = []
    , notifications = []
    , $notifications = $('#notifications')
    , slidePlayer;

    var playAudio = (function() {
        var audioFiles = [
            'arrived.mp3'
        ];
        var audioElems = {
        };
        for (var i = 0; i < audioFiles.length; i++) {
            var audioFileName = audioFiles[i];
            var audio = new Audio();
            audio.src = '/media/' + audioFileName;
            audioElems[audioFileName] = audio;
        }
        return function(audioFileName) {
            var audioElem = audioElems[audioFileName];
            audioElem.play();
        };
    })();
    
    function init() {
        zapper.connect(function(err) {
            if (err) {
                console.log(err);
                alert('エラーが発生しました。' + err.message);
                return;
            }
            currentEvent = zapper.event({'id': '51ecca6063b71c4b39000012'});
            //currentEvent = zapper.event({'id': '5171e0a376194a8aaa000001'});
            
            currentEvent.subscribe('zap', function(zap) {
//                playAudio('arrived.mp3');
                notifications.push({
                    type: 'zap',
                    value: zap
                });
            });
            currentEvent.subscribe('message', function(message) {
                notifications.push({
                    type: 'message',
                    value: message
                });
            });
            setInterval(function() {
                while (notifications.length > 0) {
                    var data = notifications.shift();
                    var value = data.value;
                    var author = value.author;
                    var $li = $(document.createElement('li'));

                    if (data.type === 'zap') {
                        for (var i = 0, n = value.count; i < n; i++) {
                            var $icon = $(document.createElement('img'));
                            $icon.addClass('icon').attr({
                                src: author.photo
                            });
                            $li.append($icon);
                        }
                    } else if (data.type === 'message') {
                        var $icon = $(document.createElement('img'));
                        $icon.addClass('icon').attr({
                            src: author.photo
                        });
                        var $message = $(document.createElement('span'));
                        $message
                            .addClass('message')
                            .text(value.text);
                        $li.append($icon).append($message);
                    }
                    
                    $li.on('webkitAnimationEnd mozAnimationEnd oAnimationEnd msAnimationEnd animationend', function() {
                        $(this).remove();
                    });
                    $li.appendTo($notifications);
                }
            }, 300);
        });
    }
    init();
});
