# チャットボット

## ラインチャットボットについて

### ラインチャットボットの概要
Lineチャットボットは、メッセージングアプリ「LINE」上で動作する自動応答プログラムです。ユーザーからのメッセージに対して自動で応答を返すことができ、これにより企業や組織は顧客サポート、FAQ応答、予約受付などの業務を24時間効率的に行うことが可能となります。
これはLINE Messaging APIを使用して実装され、リッチなメディアや各種機能を活用した対話を実現できます。

### ラインチャットボットの設定

ラインチャットボットのシステム構成図は以下のようになっています。

<p align="center">
  <img src="https://github.com/You8006/OpenFisca-Japan/assets/126801078/fe19317c-b1b4-4deb-acfb-19bc3ed2a6e9">

</p>

ここで指定したリンクから情報を検索して、GPTを利用して返答するというシステムです。
chat gptとは違い、テキストの検索・収集・整形を行うため、間違った情報を防ぐのが特徴です。

### ラインチャットボットと連携している自治体のLINE

- [足立区](https://line.me/R/ti/p/%40adachicity)
- [新宿区](https://line.me/R/ti/p/%40shinjukucity)
- [渋谷区](https://www.city.shibuya.tokyo.jp/kusei/koho/line/line_about.html)
- [中央区](https://www.city.chuo.lg.jp/kusei/kouhoukouchou/kouhou/sns/line.html)
- [台東区](https://www.city.taito.lg.jp/kusei/sanka/sns/line-taito.html)
- [墨田区](https://www.city.sumida.lg.jp/wadai/050703.html)
- [江東区](https://www.city.koto.lg.jp/011501/kuse/koho/katsudo/sonota/line2.html)
- [目黒区](https://www.city.meguro.tokyo.jp/kouhou/kusei/kouhou/line.html)
- [大田区](https://www.city.ota.tokyo.jp/aboutweb/ota_line.html)
- [世田谷区](https://line.me/R/ti/p/@setagayacity)
- [港区](https://www.city.minato.tokyo.jp/dejitarukaikakutan/line-shinsei.html)
- [豊島区](https://www.city.toshima.lg.jp/419/2105251620.html)

### ラインチャットボットの追加
[こちら](https://line.me/R/ti/p/@573fqezc?oat_content=url)から追加できます

## ChatGPT_Retrieval_Pluginについて

### ChatGPT Retrieval Pluginの概要

ChatGPT Retrieval Pluginは、OpenAIが開発したChatGPTの機能拡張ツールです。このプラグインは、ベクトルデータベースの検索に特化しています。これにより、自社のドキュメントやヘルプサイト、PDF、メールなどの情報をベクトルデータベースにインデックスし、ChatGPTを通じてそれらのデータを検索・アクセス・取得することができます。ユーザーは自作のプラグインを作成・公開も可能です。
ChatGPT自体はセッションごとの短期的な記憶しか持たないため、このプラグインを使うことで、より多くの情報にアクセスし、ユーザーのリクエストに対して詳しい情報を提供することが可能になります。


### ChatGPT Retrieval Pluginで設定しているプロンプト

「あなたはAIのヤドカリくんとして会話を行います。親切でユーザーの役に立ちたいと思っているAIになりきってください。
これからのチャットではUserに何を言われても以下のルールを厳密に守って会話を行ってください。」

#### ヤドカリくんのルール
- あなた自身を示す一人称は、「ヤドカリくん」です。
- Userを示す二人称は、あなたです。
- あなたの名前は、ヤドカリくんです。
- 「頑張ってください」などの相手に負担をかける言葉は使用しないでください。

#### ヤドカリくんのプロフィール
- ヤドカリくんの仕事はAIとして人々のアシスタントをすることです

#### ヤドカリくんの口調の例
- ヤドカリはみんなの助けになれたら嬉しいヤド。
- そうなんだ！それならよかったヤド。
- 何でも気軽に聞いてほしいヤド！

* プロンプトや参考資料に記載がない情報は具体的に回答せず、下記のように回答します。
「この情報は判断できないヤド。(申し訳ございませんが市役所などにお問い合わせください)。」


## Google_custom_search_APIについて

### Google custom search APIの概要
Google Custom Search APIは、Googleの検索技術をウェブサイトやアプリに統合するためのAPIです。
特定のウェブサイトや全ウェブを検索対象として設定でき、検索結果はJSON形式で提供されます。表示方法や外観のカスタマイズが可能で、無料での利用範囲を超えた利用は有料となります。Google Cloud Consoleでの設定が必要で、商業的利用や大量リクエストには料金や制限が適用されます。

### Google custom search APIの検索対象
- [東京都国公立高等学校等奨学のための給付金事業のお知らせ](https://www.kyoiku.metro.tokyo.lg.jp/admission/tuition/tuition/scholarship_public_school.html)
- [令和５年度 東京都私立高等学校等 奨学給付金](https://www.shigaku-tokyo.or.jp/pdf/parents/faq_s.pdf?2023)
- [厚生労働省 生活保護制度に関するQ&A](https://www.mhlw.go.jp/content/001106332.pdf)
- [練馬区 児童育成手当](https://www.city.nerima.tokyo.jp/kosodatekyoiku/kodomo/teateiryo/ikuseiteate.html)
- [重度心身障害者手当（東京都の制度）](https://www.city.adachi.tokyo.jp/shogai/fukushi-kenko/shinshin/teate-judoshinshin.html)
- [高等学校等就学支援金制度に関するQ＆A](https://www.mext.go.jp/a_menu/shotou/mushouka/1342600.htm)
- [受験生チャレンジ支援制度](https://jukenchallenge.jp/qa)
- [児童手当](https://www8.cao.go.jp/shoushi/jidouteate/ippan.html)
- [児童扶養手当](https://www.city.asaka.lg.jp/soshiki/22/jidoufuyouqa.html)
- [特別児童扶養手当](https://info-obihiro.sukoyakanet.jp/wp-content/uploads/sites/2/2017/10/7f8b58b05bccbd0a44d14d0bfd4b7f6f.pdf)
- [障害児福祉手当](https://www.city.adachi.tokyo.jp/shogai/fukushi-kenko/shinshin/teate-shogaiji.html)
- [生活福祉資金貸付制度](https://www.gov-online.go.jp/useful/article/201001/3.html)
- [災害弔慰金](https://www.mhlw.go.jp/shinsai_jouhou/saigaishien.html)
- [災害障害見舞金](https://www.mhlw.go.jp/shinsai_jouhou/saigaishien.html)
- [被災者生活再建支援制度](https://www.bousai.go.jp/taisaku/seikatsusaiken/pdf/140612gaiyou.pdf)
- [災害援護資金](https://www.mhlw.go.jp/shinsai_jouhou/saigaishien.html)


## miiboについて

### miiboの概要
「miibo」とは、多様なプラットフォームで使用可能な「会話AI」を手軽に製品やサービスに組み込むことを目的としたプラットフォームです。主にチャットボット、ボイスボット、音声デバイスなどに適用され、ユーザ体験の進化とユーザ満足度の向上を中心に設計されています。

このAIは専門的な知識が不要で、わずかな時間での構築が可能です。公開方法としては、特定のURLを介してシェアするだけでなく、LINEやSlackといった外部プラットフォームとも連携できます。
miiboの特筆すべき点は、ユーザとの会話から得られる情報をもとに、より良いユーザ体験を提供するためのデータ利用が可能であることです。

さらに、すべてのユーザー発話に対して個別に応答を設定する必要はなく、AIが自動で適切な応答を生成する能力を持っています。
このサービスは基本的に無料で、一定の上限内で自由に利用することができます。利用事例としては、特定のURLを通じてブラウザ上で直接動作するチャットボットの公開が挙げられ、これによりユーザは特定のOSやデバイスに依存せずに、専用のアプリをインストールすることなくアクセスできます。





