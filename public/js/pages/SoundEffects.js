(function(global) {
    'use strict';

    var goImg = (function() {
        var img = new Image();
        img.src = '/img/go_line_200.png';
        return img;
    })();
    var dotImg = (function() {
        var img = new Image();
        img.src = '/img/dot_line_200.png';
        return img;
    })();

    
    // 5zap=ゴ
    
    // zapが来るたびに、カウントをプラスする
    // タイマーがチェックし、カウントを5減らす
    // カウントが5を超えていたら、一つ「ゴ」を出す。
    // カウントが5未満だったら、「ゴ」が一つ前に出ていれば「...」を、それ以外は何もしない。
    var GO_COUNT = 5;
    var ANIM_INTERVAL = 1000;

    function SoundEffects(canvas, options) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.count = 0;
        this._imgList = [];
        this.options = options || {};
        this._start();
    }
    SoundEffects.prototype = {
        addCount: function(n) {
            this.count += n;
        },
        _start: function() {
            var self = this;
            var imgList = self._imgList;
            // アニメーションの対象となるオブジェクトの構築
            setInterval(function() {
                if (self.count >= GO_COUNT) {
                    imgList.push({
                        type: 'go',
                        img: goImg,
                        timestamp: Date.now()
                    });
                    self.count -= GO_COUNT;
                } else {
                    // 最後が「・・・」以外の文字で終わっていたら、「・・・」を出す
                    if (imgList.length > 0 && imgList[imgList.length - 1].type !== 'dot') {
                        imgList.push({
                            type: 'dot',
                            img: dotImg,
                            timestamp: Date.now()
                        });
                    }
                    self.count = 0;
                }
            }, ANIM_INTERVAL);
            // アニメーションループ
            if (self.options.autoDraw) {
                var drawFrame = function() {
                    self.draw();
                    requestAnimationFrame(drawFrame);
                };
                drawFrame();
            }
        },
        draw: function() {
            var self = this;
            var imgList = this._imgList;
            if (imgList.length === 0) {
                return;
            }
            var now = Date.now();
            
            (function calcPos() {
                var Y = 20;
                var startElem = null;
                while (true) {
                    if (imgList.length === 0) {
                        return;
                    }
                    var startElem = imgList[0];
                    var startTime = startElem.timestamp;
                    var distance = (now - startElem.timestamp) / 10;
                    var x = self.canvas.width - distance;
                    // 画面外に描画する画像はリストの先頭から削除する
                    if (x < -startElem.img.naturalWidth) {
                        imgList.shift();
                    } else {
                        startElem.x = x;
                        startElem.y = Y;
                        break;
                    }
                }
                var prevElem = startElem;
                for (var i = 1, n = imgList.length; i < n; i++) {
                    var elem = imgList[i];
                    elem.x = prevElem.x + prevElem.img.naturalWidth;
                    elem.y = Y;
                    prevElem = elem;
                }
            })();
            
            for (var i = 0; i < imgList.length; i++) {
                var elem = imgList[i];
                var img = elem.img;
                var x = elem.x;
                var y = elem.y;
                self.ctx.drawImage(img, x, y, img.naturalWidth, img.naturalHeight);
                console.log('x=' + x + ',y=' + y + ',w=' + img.naturalWidth + ',h=' + img.naturalHeight);

            }
        }
    };
    global.SoundEffects = SoundEffects;
})(this);
