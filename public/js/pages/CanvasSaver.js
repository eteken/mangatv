(function(global) {
    var fileSystem;

    function initFileSystem(callback) {
        window.webkitRequestFileSystem(
            TEMPORARY,  // 一時的（テンポラリ）
            1024 * 1024 * 300,  // 確保するサイズ
            function(fs){ // 成功時のコールバック関数
                fileSystem = fs;
                callback(null, fs);
            },
            function(err){  // 失敗時のコールバック関数
                callback(err);
            });
    }

    var CanvasSaver = function(canvas, options) {
        this.canvas = canvas;
        this.options = options || {};
    };
    CanvasSaver.prototype = {
        init: function(callback) {
            var self = this;
            initFileSystem(function(error, result) {
                if (error) {
                    callback(error);
                } else {
                    self.parentDir = fileSystem.root; // TODO: 変更できるように
                    callback(null, result);
                }
            });
            
        },
        save: function(callback) {
            var self = this;
            var fileName = Date.now() + '.png';
            console.log(fileName);
            self.canvas.toBlob(function(blob) {
                self.parentDir.getFile(
                    fileName,
                    { create: true, exclusive: true },
                    function(file) {
                        file.createWriter(
                            function(writer) {
                                writer.onwriteend = function() {
                                    callback(null);
                                };
                                writer.onerror = function() {
                                    callback(writer.error);
                                };
                                writer.write(blob);
                            },
                            function(error) {
                                callback(writer.error);
                            });
                    },
                    function(error) {
                        callback(error);
                    });
            });
        },
        list: function(callback) {
            var self = this;
            self.parentDir.createReader().readEntries(
                function(entries) {
                    console.log(entries.length);
                    var entryURLs = [];
                    for (var i = 0, n = entries.length; i < n; i++) {
                        entryURLs.push(entries[i].toURL());
                    };
                    entryURLs.sort();
                    callback(null, entryURLs);
                },
                function(error) {
                    callback(error);
                });
        },
        clear: function(callback) {
            this.parentDir.createReader().readEntries(
                function(entries) {
                    var removed = 0;
                    var error = null;
                    for (var i = 0, n = entries.length; i < n; i++) {
                        if (error) {
                            callback(error);
                            return;
                        }
                        var entry = entries[i];
                        entry.remove(function() {
                            removed++;
                            if (removed === n) {
                                callback();
                            }
                        }, function(err) {
                            error = err;
                        });
                    }
                },
                function(error) {
                    callback(error);
                });
        }
    };
    global.CanvasSaver = CanvasSaver;
})(this);
