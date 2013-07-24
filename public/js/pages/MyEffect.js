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
        this.img_toon;
        this.dotList;
        this.width;
        this.height;
        this.data_quant = [];
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

    myEffect.prototype.set = function(width, height) {
        this.width = width; this.height = height;
        this.img_toon = this.ctx.createImageData(width, height)
    }


    // 35 - 37msec // もともと
    // 24 msec // 階調化を比較演算
    // 15 msec // とりあえず、エッジ抽出を外した
    // 7 msec // 2の乗数計算をビットシフトに変更
    // 12 - 13mseca // エッジ抽出を入れつつ、配列をやめたり、インライン展開したり
    myEffect.prototype.toon = function(img, width, height){
        var dotList = img.data;
        // var edge = this.detect_edge(img, width, height)

        this.data_quant.length = 0;
        var gray, around;
        var tmp;
        // var img_toon = this.ctx.createImageData(width, height)
        var img_toon = this.img_toon
        var a0, a1, a2, a3;
        var c, i, e;
        var p;
        var cons = 715827883;
        // for(var i = 0, l = dotList.length; i < l; i+=4){
        for(var y = 1; y < height-1; y++){
            for(var x = 1; x < width-1; x++){
                c = y * width + x;

                i = c << 2;


                tmp = (c - width) << 2;
                a0 = ((dotList[tmp] + dotList[tmp+1] + dotList[tmp + 2]) /3) & 0xc0;
                tmp = (c - 1) << 2;
                a1 = ((dotList[tmp] + dotList[tmp+1] + dotList[tmp + 2]) /3) & 0xc0;
                tmp = (c + 1) << 2;
                a2 = ((dotList[tmp] + dotList[tmp+1] + dotList[tmp + 2]) /3) & 0xc0;
                tmp = (c + width) << 2;
                a3 = ((dotList[tmp] + dotList[tmp+1] + dotList[tmp + 2]) /3) & 0xc0;
                gray = (dotList[i] + dotList[i+1] + dotList[i + 2] ) /3; 

                around = (a0 + a1 + a2 + a3) >> 2;
                if(around < (gray & 0xc0)) e = true;
                else e = false;

                // 明瞭化処理
                if(gray > this.dark) {
                    gray = (gray * this.blight);
                }
                //階調化
                var gra;
                if(gray < 85) {
                    gra = 0;
                } else if(gray < 170) {
                    gra = 1;
                } else {
                    gra = 255;
                }

                //　スクリーントーン化 
                if( gra === 1 ) {
                    var dx = (i % (width << 2)) >> 2;
                    var dy = (i / (width << 2))|0;
                    var dx_ = dx & 0x03;
                    var dy_ = dy & 0x03;

                    if( dx_ === 0 && dy_ === 0) {
                        gra = 0;
                    } else if(dx_ === 2 && dy_ === 2){
                        gra = 0;
                    } else {
                        gra = 255;
                    }
                };

                //漫画生成
                if(e) {
                    img_toon.data[i] = 0;
                    img_toon.data[i+1] = 0;
                    img_toon.data[i+2] = 0;
                } else {
                    img_toon.data[i] = gra;
                    img_toon.data[i+1] = gra;
                    img_toon.data[i+2] = gra;
                }
                img_toon.data[i+3] = 0xff; //img.data[i + 3];
            }
        }
        return img_toon;
    }
}());

