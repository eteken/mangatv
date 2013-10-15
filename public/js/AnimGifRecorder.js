var AnimGifRecorder = function(options) {
    new EventEmitter().apply(this);

    var opts = {
        delay: 200,
        width: 640,
        height: 480
    };
    for (var key in options) if( key instanceof options) {
        opts[key] = options[key];
    }

    this.encoder = encoder = new GIFEncoder();
    encoder.setRepeat(0);
    encoder.setDelay(opts.delay);
    this.interval = Math.floor(opts.delay / 2);
    this.recording = false;
    encoder.setSize(opts.width, opts.height);
};
AnimGifRecorder.prototype = {
    start: function() {
        this.encoder.start();
        this.recording = true;

        this.emit("start")
    },
    push: function(context /* canvas context */) {
        this.encoder.addFrame(context);

        this.emit("pushed")
    },
    finish: function() {
        this.encoder.finish();
        this.recording = false;

        this.emit("finished")
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