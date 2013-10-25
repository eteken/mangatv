
// 下準備
//////////////////////////////////////////////////////

var stream = new Stream() // 映像ストリーム
	, manga = new Manga() // マンガ化処理
	, record = new Record() // 画像録画
	, deco_b // デコ用（下線）
	, deco_f // デコ用（上線）
    , decoEvent // deco_bとdeco_fのイベントトリガ
	, merger = new Merger() // 録画画像とデコをマージする
	, gifrecorder = new AnimGifRecorder() // GIF化処理

$("#manga").hide();
$("#animation").hide();

// マンガストリーム開始
//////////////////////////////////////////////////////

stream.on('stream', function(stream){
	startManga(stream)
})

var startManga = function(stream){
	$("#animation").hide();
	$("#manga").fadeIn();
	$("#status").html("＼(^o^)／ ヤッター")

	if(stream) manga.start(stream)
}


// 録画開始
//////////////////////////////////////////////////////
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
//////////////////////////////////////////////////////
var startDeco = function(){
	$("#manga").hide();
	$("#animation").fadeIn('slow');

	// 録画画像表示
	record.check();

	// デコ用のキャンバスを表示（下線のレイヤと、上線のレイヤ）
	deco_b = new Deco({line_width: 14, line_color: "#fff"});
	deco_f = new Deco();

    decoEvent = new DecoEvent();
    decoEvent.setCanvasRect(deco_b.getCanvasRect());
    decoEvent.handler();
    decoEvent.addObserver(deco_b.notify());
    decoEvent.addObserver(deco_f.notify());
}



//
// GIF化処理
/////////////////////////////////////////////////////

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



