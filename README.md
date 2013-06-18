漫画テレビ
=======

# video_node

getUserMediaからのストリーム映像を、顔認識したのち漫画風に変換して、顔認識情報と、漫画JPEGをswitch_nodeに流しこむ

# mic_node

マイクからとった音声を Web Speech APIを使ってテキストに変換。viewer_nodeに流しこむ（switcher_nodeでもいいかも？）

# switcher_node

複数取得したvideo_nodeからのアングルのうち、一つを選択してview_nodeに流しこむ。オープニング画像や幕真の画像なんかも、ここでスイッチ

# viewer_node

switcherからのパラパラ漫画と、mic_nodeからのテキストを合成し、吹き出しをつけたり。あと、twitterでだんまくを入れたり。観客からの「かっこいいね！！」で「ゴゴゴゴゴ」とかのエフェクトを入れたり。
