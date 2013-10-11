
var stream = new Stream()
	, manga = new Manga()
	, record = new Record()
	, gifrecorder = new AnimGifRecorder()
	, deco
	, merger = new Merger()

$("#manga").hide();
$("#animation").hide();

// マンガストリーム開始

stream.on('stream', function(stream){
	startManga(stream)
})

var startManga = function(stream){
	$("#animation").hide();
	$("#manga").fadeIn();
	$("#status").html("ヤッター")
	
	if(stream) manga.start(stream)
}


// 録画開始

$('#record').on('click', function(){
	record.start();
})

record.on('start', function(){
	$("#status").html("録画中・・・")
})
record.on('pushed', function(num){
	$("#status").html("録画中・・・ "+num+" / 10")
})
record.on('completed', function(e){
	$("#status").html("録画完了（デコれるよん）")

	startDeco();
})


// デコ開始

var startDeco = function(){
	$("#manga").hide();
	$("#animation").fadeIn('slow');

	record.check();
	deco_b = new Deco({line_width: 14, line_color: "#fff"});
	deco_f = new Deco();
}

$('#build-gif').on('click', function(){
	var contexts = record.getContexts();
	var ctx_deco_b = deco_b.getContext();
	var ctx_deco_f = deco_f.getContext();
	gifrecorder.start();

	for(var i = 0, l = contexts.length; i < l; i++) {
		var ctx_ = merger.do([contexts[i], ctx_deco_b, ctx_deco_f])
		gifrecorder.push(ctx_);
	}
	gifrecorder.finish();
})

gifrecorder.on('start', function(data){
	$("#status").html("GIF化処理開始")
})
gifrecorder.on('pushed', function(data){
	$("#status").html("GIF化処理中："+data)
})
gifrecorder.on('finished', function(data){

	var dataURL = gifrecorder.toDataURL();

	window.open(dataURL)

	startManga();
})



