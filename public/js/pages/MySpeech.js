(function(global){
    var MySpeech = function(){
        this.buffer = [];
        this.tmp = "";
        this._init();
        this._timer;
    };

    MySpeech.prototype._init = function(){
        this.recognition = new webkitSpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'ja-JP';
        // this.recognition.lang = 'en';

        this.recognizing = false;
        this.errorHappenned = false;
        this._setupHandler();

        this.recognition.start();
    }

    MySpeech.prototype._setupHandler = function(){
        this.recognition.onstart = function(){
            $("#rec-state").text("認識待ち")
            this.recognizing = true;
        }.bind(this)
        this.recognition.onerror = function(ev){
            console.log(ev);
            $("#rec-state").text("エラー発生")
            this.recognizing = false;
        }.bind(this)
        this.recognition.onend = function(){
            $("#rec-state").text("終了")
            this.recognizing = false;
        }.bind(this)
        var self = this;
        this.recognition.onresult = function(event) {
            for (var i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    var result = event.results[i][0].transcript;
                    this._push(result)
                    this.recognition.stop();
                    if (typeof self.onRecognized === 'function') {
                        self.onRecognized(result);
                    }
                } else {
                    var candidate = event.results[i][0].transcript
                    if(candidate.length > 10) {
                        this._push(candidate)
                        this.recognition.stop();
                    } else {
                        this._push("...")
                        $("#rec-state").text("認識中："+candidate)
                    }
                }
            }
        }.bind(this)

        //restart recognition when stopped
        setInterval(function(e){
            if(!!this.recognizing === false) {
                $("#rec-state").text("再認識開始")
                this.recognition.start();
            }
        }.bind(this), 300);
    }

    MySpeech.prototype._push = function(str){
        this.buffer.push(str);
    }
    MySpeech.prototype._get = function(){
        if(this.buffer.length > 0) {
            return this.buffer.shift();
        } else {
            return !!this._timer ? null : "";
        }
    }

    MySpeech.prototype.appendCanvas = function(ctx, w, h){
        var str = this._get();
        if(!!str) {
            if(!!this._timer) clearTimeout(this._timer);
            this._timer = setTimeout(function(e){
                this._timer = null;
            }.bind(this), 3000)
        }

        if(!!this._timer) {
            ctx.fillStyle = "rgba(255,255,255, 0.8)"
            ctx.fillRect(10, h - 60, w - 20, 35)

            this.tmp = str || this.tmp;

            switch (this.tmp) {
            case 'ドン': case 'ドーン':
            case 'どん': case 'どーん':
                MyPow.pow(ctx);
                soundEffects.command('don');
                return;
            case 'バン': case 'バーン':
            case 'ばん': case 'ばーん':
            case 'パン': case '3':
            case 'ワーナー': case 'バーナー':
                MyPow.pow(ctx);
                soundEffects.command('ban');
                return;
            }
            var recognized = this.tmp.indexOf("...") === 0;
            ctx.font = "bold 30px 'ＭＳ ゴシック'"; 
            ctx.textAlign = "center"
            ctx.fillStyle = recognized ? "#666" : "#000"
            ctx.fillText(this.tmp, w / 2, h-30, w-20);
        }
    }
    global.MySpeech = MySpeech;
}(window))

