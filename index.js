$(window).load(function() {

    function init(image) {
        var placeholder = document.getElementById('placeholder');

        // Try to get a WebGL canvas
        try {
            var canvas = fx.canvas();
        } catch (e) {
            placeholder.innerHTML = e;
            return;
        }

        navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

        var constraints = {audio: false, video: true};

        function successCallback(stream) {
            window.stream = stream; // stream available to console
            var video = document.getElementById("v");
            video.src = window.URL.createObjectURL(stream);
            video.play();
            var texture = canvas.texture(video);
            canvas.draw(texture).dotScreen(0, 0, 0, 3).update().replace(placeholder);
            setInterval(function() {
                if (!video.ended) {
                    texture = canvas.texture(video);
                    canvas.draw(texture).dotScreen(0, 0, 0, 2).update();
                    var comp = ccv.detect_objects({ "canvas" : (ccv.pre(canvas)),
                                                    "cascade" : cascade,
                                                    "interval" : 5,
                                                    "min_neighbors" : 1 });
                    console.log(comp);
                }
            }, 200);
        }

        function errorCallback(error){
            console.log("navigator.getUserMedia error: ", error);
        }

        navigator.getUserMedia(constraints, successCallback, errorCallback);

        /*
        $(document).mousemove(function(e) {
            var offset = $(canvas).offset();
            var x = e.pageX - offset.left;
            var y = e.pageY - offset.top;
            canvas.draw(texture).swirl(x, y, 200, 4).update();
        });
        */
    }
    var image = new Image();
    image.onload = function() {
        init(image);
    };
    image.src = 'image.jpg';
});
