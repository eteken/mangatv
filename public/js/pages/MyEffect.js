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

