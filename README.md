# OpenFisca Japan （支援みつもりヤドカリくん）

## 概要
日本の制度のシミュレーターです。  
世帯の情報を入力すると、利用可能な制度と手当額が簡易的に算出されます。  
2023/9/18時点で、以下の子育て支援制度に対応しています。

- 児童手当
- 児童扶養手当
- 特別児童扶養手当
- 障害児福祉手当
- 生活福祉資金貸付制度
- 生活保護
- 高等学校奨学給付金
- 児童育成手当（東京都）
- 障害児童育成手当（東京都）
- 重度心身障害者手当（東京都）

## 作成Webアプリ
[支援みつもりヤドカリくん](https://myseido-simulator.netlify.app/)に作成されたWebアプリが公開されています。  
mainブランチのソースコードがビルド・デプロイされています。  
フロントエンド(React)はNetlify、バックエンド(OpenFisca)はGoogle CloudのCloud Runでビルド・デプロイされています。

## 開発参加方法
- リポジトリをフォークし、**develop**ブランチ（あるいはそこから新たに切ったブランチ）にチェックアウトしてコミットを行ってください。（developブランチに最新の開発状況が反映されています。）
  - （参考）[フォーク・クローン・プルリクエストの流れ](https://techtechmedia.com/how-to-fork-github/) 
- プルリクエストでマージを要求するブランチはdevelopブランチとしてください
  - デフォルトではmainブランチとなっているため、developブランチに変更する必要があります
- Issueに着手される際は、他コントリビューターと重複を防ぐため、着手したことをコメントに記載お願いします
  - 1つのIssueを複数人で分担して進めていただいても構いません
  - 部分的なpull requestやドラフトのpull requestを出していただいても構いません

## その他の情報

project-inclusiveの開発方針やOpenFiscaそのもの等の情報は、[本リポジトリのDocumentPages](https://project-inclusive.github.io/OpenFisca-Japan/)に記載しています。


## お問い合わせ
[防窮研究所](https://www.facebook.com/Institute.for.Poverty.Prevention)