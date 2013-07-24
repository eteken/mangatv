$(function() {
    'use strict';
    var imageList = $('#image-list');
    var canvasSaver = new CanvasSaver();
    canvasSaver.init(function(error, fs) {
        if (error) {
            console.error(error);
            return;
        }
        loadImages();
    });

    var loadImages = function() {
        imageList.empty();
        canvasSaver.list(function(error, urls) {
            if (error) {
                console.error(error);
                return;
            }
            urls.forEach(function(url) {
                var li = $(document.createElement('li'));
                var img = $(document.createElement('img'));
                img.attr({
                    src: url
                });
                li.append(img).appendTo(imageList);
            });
            imageList.turn();
        });
    };
    $('#clearButton').on('click', function() {
        canvasSaver.clear(function(error, result) {
            if (error) {
                console.error(error);
            }
            loadImages();
        });
    });
});
