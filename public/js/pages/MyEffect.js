var myEffect;

(function(){
    var BRIGHT, DARK;

    myEffect = function(ctx, option){
        if(!!ctx === false) return false;
        if(!(this instanceof myEffect)) return new myEffect(ctx);

        // Definition of constant.
        option = option || {};
        this.TONE = 86; // 階調
        this.bright = parseInt(localStorage.bright) || option.bright || 72; // 明るさ
        this.dark = parseInt(localStorage.dark) || option.dark || 148; // 暗さの境界値

        // this.bright *= 3;
        // this.dark *= 3;

        this.ctx = ctx; // canvas context object
        this.img_toon;
        this.dotList;
        this.width;
        this.height;
        this.data_quant = [];

        BRIGHT = parseInt(this.bright);
        DARK = parseInt(this.dark);
    }

    myEffect.prototype.changeBright = function(num){
        num = parseInt(num) & 0xff;
        localStorage.bright = num;
        this.bright = parseInt(num);
        BRIGHT = parseInt(num);
    }

    myEffect.prototype.changeDark = function(num){
        num = parseInt(num) & 0xff;
        localStorage.dark = num;
        this.dark = parseInt(num);
        DARK = parseInt(num);
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
    // 9 - 10msec // 3の割り算を近似計算
    // 4 - 5 msecそもそも割り算とかいらなかったとか、プロパティ参照やめたとか
    myEffect.prototype.toon = function(img, width, height, options){
        // edgeとtoneがfalseの時は何もしない
        if(!options.edge && !options.tone) return img;

        var dotList = img.data;

        this.data_quant.length = 0;
        var gray, around;
        var tmp;
        var img_toon = this.img_toon
        var a0, a1, a2, a3;
        var c, i;
        var p;
        var FILTER = 0xff00;

        var x, y, gra, dx_, dy_;
        for(var y = 1; y < height-1; y++){
            for(var x = 1; x < width-1; x++){

                c = y * width + x;

                i = c << 2;

                tmp = (c - width) << 2;
                a0 = (dotList[tmp] + dotList[tmp+1] + dotList[tmp + 2]) & FILTER;
                tmp = (c - 1) << 2;
                a1 = (dotList[tmp] + dotList[tmp+1] + dotList[tmp + 2]) & FILTER;
                tmp = (c + 1) << 2;
                a2 = (dotList[tmp] + dotList[tmp+1] + dotList[tmp + 2]) & FILTER;
                tmp = (c + width) << 2;
                a3 = (dotList[tmp] + dotList[tmp+1] + dotList[tmp + 2]) & FILTER;

                gray = (dotList[i] + dotList[i+1] + dotList[i + 2] );


                if((a0 + a1 + a2+ a3) < ((gray & FILTER) << 2)) {
                    if(options.edge) {
                        img_toon.data[i] = 0;
                        img_toon.data[i+1] = 0;
                        img_toon.data[i+2] = 0;
                    }
                } else {
                    if(options.tone) {
                        if( gray < DARK ) {
                            gra = 0;
                        } else if( gray > BRIGHT ) {
                            gra = 255;
                        } else {
                            gra = 1;
                        }

                        //　スクリーントーン化
                        if( gra == 1 ) {
                            dx_ = (x & 0x03)
                            dy_ = (y & 0x03)


                            if( (!dx_ && !dy_) || (dx_ == 2) && (dy_ == 2)){
                                gra = 0;
                            } else {
                                gra = 255;
                            }
                        };
                    } else {
                        gra = 255;
                    }


                    //漫画生成
                    img_toon.data[i] = gra;
                    img_toon.data[i+1] = gra;
                    img_toon.data[i+2] = gra;
                }
                img_toon.data[i+3] = 0xff; //img.data[i + 3];
            }
        }
        return img_toon;
    }

    myEffect.prototype.slowtoon = function(img, width, height, options){
        // edgeとtoneがfalseの時は何もしない
        if(!options.edge && !options.tone) return img;

        var sum = function(a, b, c) {
          return (a + b + c);
        }

        var dotList = img.data;

        this.data_quant.length = 0;
        var gray, around;
        var tmp;
        var img_toon = this.img_toon
        var a0, a1, a2, a3;
        var c, i;
        var p;
        var FILTER = 0xff00;

        var x, y, gra, dx_, dy_;
        for(var y = 1; y < height-1; y++){
            for(var x = 1; x < width-1; x++){

                c = y * width + x;

                i = c << 2;

                tmp = (c - width) << 2;
                a0 = sum(dotList[tmp], dotList[tmp+1], dotList[tmp + 2]) & FILTER;
                tmp = (c - 1) << 2;
                a1 = sum(dotList[tmp], dotList[tmp+1], dotList[tmp + 2]) & FILTER;
                tmp = (c + 1) << 2;
                a2 = sum(dotList[tmp], dotList[tmp+1], dotList[tmp + 2]) & FILTER;
                tmp = (c + width) << 2;
                a3 = sum(dotList[tmp], dotList[tmp+1], dotList[tmp + 2]) & FILTER;

                gray = sum(dotList[i], dotList[i+1], dotList[i + 2] );


                if((a0 + a1 + a2+ a3) < ((gray & FILTER) << 2)) {
                    if(options.edge) {
                        img_toon.data[i] = 0;
                        img_toon.data[i+1] = 0;
                        img_toon.data[i+2] = 0;
                    }
                } else {
                    if(options.tone) {
                        if( gray < this.dark ) {
                            gra = 0;
                        } else if( gray > this.bright ) {
                            gra = 255;
                        } else {
                            gra = 1;
                        }

                        //　スクリーントーン化
                        if( gra == 1 ) {
                            dx_ = (x & 0x03)
                            dy_ = (y & 0x03)


                            if( (!dx_ && !dy_) || (dx_ == 2) && (dy_ == 2)){
                                gra = 0;
                            } else {
                                gra = 255;
                            }
                        };
                    } else {
                        gra = 255;
                    }


                    //漫画生成
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

