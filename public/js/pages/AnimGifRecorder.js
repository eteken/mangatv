var AnimGifRecorder = function(origCanvas, options) {
    var opts = {
        delay: 200
    };
    for (var i in options) {
        opts[i] = options[i];
    }
    this.encoder = encoder = new GIFEncoder();
    encoder.setRepeat(0);
    encoder.setDelay(opts.delay);
    this.interval = Math.floor(opts.delay / 2);
    this.recording = false;
    this.origCanvas = origCanvas;
    this.canvas = canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    encoder.setSize(canvas.width, canvas.height);
    this.context = canvas.getContext('2d');
};
AnimGifRecorder.prototype = {
    start: function() {
        delete this.prevSave;
        this.encoder.start();
        this.recording = true;
    },
    save: function() {
        var now = Date.now();
        if (!this.prevSave || now - this.prevSave > this.interval) {
            var c = this.origCanvas;
            this.context.drawImage(c, 0, 0, c.width, c.height, 0, 0, this.canvas.width, this.canvas.height);
            this.encoder.addFrame(this.context);
            this.prevSave = now;
        }
    },
    finish: function() {
        this.encoder.finish();
        this.recording = false;
    },
    toArrayBuffer: function() {
        var binArray = this.encoder.stream().bin;
        return new Uint8Array(binArray).buffer;
    },
    toBlob: function() {
        var buf = this.toArrayBuffer();
        return new Blob([buf], {type: 'image/gif'});
    },
    toDataURL: function() {
        return 'data:image/gif;base64,'+encode64(this.encoder.stream().getData());
    }
};