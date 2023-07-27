# OpenFisca Japan （マイ制度シミュレーター）

## 概要
日本の制度のシミュレーターです。  
世帯の情報を入力すると、利用可能な制度と手当額が簡易的に算出されます。  
2023/4/30時点で、以下の子育て支援制度に対応しています。

- 児童手当
- 児童扶養手当
- 特別児童扶養手当
- 障害児福祉手当

## 作成Webアプリ
[マイ制度シミュレーター](https://myseido-simulator.netlify.app/)に作成されたWebアプリが公開されています。  
mainブランチのソースコードがビルド・デプロイされています。  
フロントエンド(React)はNetlify、バックエンド(OpenFisca)はGoogle CloudのCloud Runでビルド・デプロイされています。

## 開発参加方法
- フォークするブランチはmainブランチではなくdevelopブランチとしてください（developブランチが常に最新です）
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