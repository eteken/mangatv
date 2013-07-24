$(function() {
    var zapper = new Zapper({
        from: 1, // PCからの利用
        serverUrl: 'http://zapper.kakkoii.tv:80'
//        serverUrl: 'http://localhost:3001'
    })
    , currentEvent
//    , zaps = []
//    , messages = []
    , notifications = []
    , $notifications = $('#notifications')
    , slidePlayer;

    var playAudio = (function() {
        var audioFiles = [
            'arrived.mp3'
        ];
        var audioElems = {
        };
        for (var i = 0; i < audioFiles.length; i++) {
            var audioFileName = audioFiles[i];
            var audio = new Audio();
            audio.src = '/media/' + audioFileName;
            audioElems[audioFileName] = audio;
        }
        return function(audioFileName) {
            var audioElem = audioElems[audioFileName];
            audioElem.play();
        };
    })();
    
    function init() {
        zapper.connect(function(err) {
            if (err) {
                console.log(err);
                alert('エラーが発生しました。' + err.message);
                return;
            }
            currentEvent = zapper.event({'id': '51ecca6063b71c4b39000012'});
            //currentEvent = zapper.event({'id': '5171e0a376194a8aaa000001'});
            
            currentEvent.subscribe('zap', function(zap) {
//                playAudio('arrived.mp3');
                notifications.push({
                    type: 'zap',
                    value: zap
                });
            });
            currentEvent.subscribe('message', function(message) {
                notifications.push({
                    type: 'message',
                    value: message
                });
            });
            setInterval(function() {
                while (notifications.length > 0) {
                    var data = notifications.shift();
                    var value = data.value;
                    var author = value.author;
                    var $li = $(document.createElement('li'));

                    if (data.type === 'zap') {
                        /*
                        var rnd = Math.random();
                        console.log(value);
                        if(value.count === 5) {
                            if (rnd < 0.5) {
                                MyPow.pow()
                            } else {
                                //MyPow.go3();
                            }
                        }
                        */
                        soundEffects.addCount(value.count);
                        for (var i = 0, n = value.count; i < n; i++) {
                            var $icon = $(document.createElement('img'));
                            $icon.addClass('icon').attr({
                                src: author.photo
                            });
                            $li.append($icon);
                        }
                    } else if (data.type === 'message') {
                        var $icon = $(document.createElement('img'));
                        $icon.addClass('icon').attr({
                            src: author.photo
                        });
                        var $message = $(document.createElement('span'));
                        $message
                            .addClass('message')
                            .text(value.text);
                        $li.append($icon).append($message);
                    }
                    
                    $li.on('webkitAnimationEnd mozAnimationEnd oAnimationEnd msAnimationEnd animationend', function() {
                        $(this).remove();
                    });
                    $li.appendTo($notifications);
                }
            }, 300);

            
        });
    }
    init();
});
