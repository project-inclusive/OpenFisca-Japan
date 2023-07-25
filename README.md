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

## 環境構築・開発参加方法

1. Docker Desktopをインストールして起動する。
    - Windowsの場合：[WindowsでのDocker Desktop環境構築](https://chigusa-web.com/blog/windows%E3%81%ABdocker%E3%82%92%E3%82%A4%E3%83%B3%E3%82%B9%E3%83%88%E3%83%BC%E3%83%AB%E3%81%97%E3%81%A6python%E7%92%B0%E5%A2%83%E3%82%92%E6%A7%8B%E7%AF%89/)
    - Macの場合：[MacでのDocker Desktop環境構築](https://matsuand.github.io/docs.docker.jp.onthefly/desktop/mac/install/)

1. proj-inclusiveのOpenFisca-Japan Githubリポジトリ **developブランチ** を個人アカウントのリポジトリとしてフォークし、ローカル環境（自分のPC）にクローン（ダウンロード）する。  
  [フォーク・クローン・プルリクエストの流れ](https://techtechmedia.com/how-to-fork-github/)    
   リポジトリのクローンはGithub desktop, Source treeなどのツールを使うのが簡単です。
1. 自分のPC上にクローンしたOpenfisca-Japanのルートディレクトリで、WindowsならPowershell、MacならTerminalを開く。  
以下の手順でフロントエンド・バックエンドの環境構築・起動を行う。  
環境は同時に複数起動できない。  
そのため、環境を変える場合は元の環境を停止してから新しく起動する。

    - フロントエンド・バックエンドを一括で環境構築・起動  
      ```
      # docker環境を構築・起動
      docker-compose up --build
      # 「Ctrlキー＋c」でdocker環境を停止
      ```

    - バックエンドのみ環境構築・起動
      ```
      # docker環境を構築
      docker build ./ -t openfisca_japan
      # docker環境を起動
      docker run -it --rm -p 50000:50000 -v "$(pwd):/app" -u user openfisca_japan
      # $(pwd)はDockerfileが存在するディレクトリの絶対パスで置き換える必要があるかもしれません。
      # docker環境を終了
      exit
  
    - フロントエンドのみ環境構築・起動
      ```
      # dashboardのディレクトリに移動
      cd dashboard
      # docker環境を構築
      docker build ./ -t openfisca_japan_dashboard
      # docker環境を起動
      docker run -it --rm -p 30000:30000 -v "$(pwd)/src:/app/src" -u user openfisca_japan_dashboard
      # docker環境を終了
      exit
      # 元のディレクトリに戻る
      cd ..
      ```
    - フロントエンドを起動している場合は
      http://localhost:30000/ をブラウザに打ち込むとフォームが表示されます。

1. project-inclusive/OpenFisca-Japan の developブランチにプルリクエストを送る。  
（参考）[フォーク・クローン・プルリクエストの流れ](https://techtechmedia.com/how-to-fork-github/)   




## その他の情報

project-inclusiveの開発方針やOpenFiscaそのもの等の情報は、[本リポジトリのDocumentPages](https://project-inclusive.github.io/OpenFisca-Japan/)に記載しています。


## お問い合わせ
[防窮研究所](https://www.facebook.com/Institute.for.Poverty.Prevention)