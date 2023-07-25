# 開発ドキュメント

## 開発方法

### バックエンド

#### 事前準備
- バックエンドのdocker環境に入る

#### テスト実行
- 全てのテストを実行（2023/2/25時点でエラーになるため、下の「一部のテストを実行」で確認）
  - `make test` 
- 一部のテストを実行
  - `openfisca test --country-package openfisca_japan openfisca_japan/tests/<実行したいテストファイル或いはディレクトリパス>`
    - 上記コマンド実行時にテストファイル（~.yaml）を読み込みます
    - そのため、テストファイルのみ修正する場合はそれ自身を修正してコマンド実行すれば良いです
#### 内部計算方法の修正
- openfisca_japan/variables/~.py等の計算方法を規定するファイルを修正する
- 以下のコマンドでビルドを行わないとテスト時に修正が反映されない
  - `make build`
- その後、上述のテストを行う
- 通常は標準出力は表示されませんが、例外を発生させると標準出力が表示されデバッグが容易になります

#### テスト条件・結果を記載したCSVファイルから、yamlのテストファイルを自動生成する方法

```
cd make_tests
bash generate.sh
```
  
- 上記コマンドで openfisca_japan/tests/generated 以下にyamlのテストファイルが作成される
  - そのテストファイルを上述の方法でテストする

### フロントエンド
- ルートディレクトリで以下コマンドを打ち、フロントエンドとバックエンドのDocker環境を一括で起動する
  - `docker-compose up --build`
- `cd dashboard` でdashboardディレクトリにて開発する。
- http://localhost:30000/ をブラウザに打ち込み、ページを確認する。

### Dockerを使わない環境構築方法（参考）
#### GitHub Codespaceを使用する方法
Dockerを自分のPCにインストールする必要はありませんが、操作性はやや悪いです。

- （このリポジトリ を自分の GitHub アカウントに Fork する | 既に Fork してる場合は Fetch upstream する（必須））
- → Fork した自分のアカウントの側のリポジトリをブラウザで開き、緑色の「Code」ボタンをクリック
- → 「Create codespace on main」をクリック
- → 「Open this codespace in VS Code Desktop」をクリック
- → ダイアログが数回表示されるので全部 OK っぽい方をクリック
- → VSCode と GitHub を連携させるために認証が求められるので承認する
- → VSCode で GitHub Codespaces に無事に接続できたら、動作確認のために、ターミナルで `make` を実行

これだけで全員同じ環境で開発できるようになるはず。料金は 2022-07-02 現在、無料です。

##### このリポジトリを GitHub であなたのアカウントへ Fork して、 `git clone` する

##### Fork したあなたのリポジトリで、GitHub Codespaces を起動して、Visual Studio Code で開く

[![Image from Gyazo](https://i.gyazo.com/a29c4cce16baca1b33978231849b2269.png)](https://gyazo.com/a29c4cce16baca1b33978231849b2269)
[![Image from Gyazo](https://i.gyazo.com/1351c39a5ac9a4f5a4a4ae9901ec12d6.png)](https://gyazo.com/1351c39a5ac9a4f5a4a4ae9901ec12d6)

##### GitHub Codespaces で動作確認する

```
make
```

##### GitHub Codespaces で API サーバーとして動かす

```
make serve-local
```

- GET http://localhost:50000/spec
- GET http://localhost:50000/entities
- GET http://localhost:50000/variables
- GET http://localhost:50000/parameters

## デプロイ方法

### バックエンド（OpenFisca Python APIサーバー）
#### ローカルでdockerイメージを作りcloud runにデプロイする
- `docker build -t gcr.io/openfisca-shibuya/openfisca-shibuya-deploy-test -f Dockerfile_cloud --platform amd64 .`
  - M1 Macの場合、`--platform amd64`が必要
- `docker push gcr.io/openfisca-shibuya/openfisca-shibuya-deploy-test:latest`
  - でGCPのcontainer registoryに保存される
- Cloud Runでアップしたdocker imageを選択してデプロイする
- Makefile内の環境変数は`$hoge`では認識されない。他の記載方法がある？

### フロントエンド
- メンテナンス中
