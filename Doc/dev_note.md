## バックエンドOpenFisca Python APIサーバーデプロイ方法

### ローカルでdockerイメージを作りcloud runにデプロイする

- `docker build -t gcr.io/openfisca-shibuya/openfisca-shibuya-deploy-test -f Dockerfile_cloud --platform amd64 .`
M1 Macの場合、`--platform amd64`が必要。

- `docker push gcr.io/openfisca-shibuya/openfisca-shibuya-deploy-test:latest`
でGCPのcontainer registoryに保存される。

- Cloud Runでアップしたdocker imageを選択してデプロイする。

- Makefile内の環境変数は`$hoge`では認識されない。他の記載方法がある？


## フロントエンド

- Github Pages上にViteでビルドしたアプリをデプロイするには、vite.config.tsにリポジトリ名を設定する必要がある。（Github pagesのリンクは `<アカウント名>/<リポジトリ名>/`になるため。
    ```
    export default defineConfig({
    plugins: [react()],
    base: process.env.GITHUB_PAGES
        ? "OpenFisca-Japan" // レポジトリ名を設定
        : "./",
    });
    ```

## その他

- テストパターンCSVの所得 -> テストファイルyamlの収入 -> OpenFiscaの所得　が0.5単位に丸められるため、所得が一致しない可能性がある。  
テストパターンCSVの所得が境界値下なのか上なのか分からないと、収入をどちらに丸めれば良いかわからないため、テストファイルyamlには所得を直接記載する。  
jsonでOpenFisca APIにPOSTするときは途中で算出される値を入力するとエラーになるが、yamlでテストファイルを入力する際はエラーにならない。



## Dockerを使わない環境構築方法（参考）
### GitHub Codespaceを使用する方法
Dockerを自分のPCにインストールする必要はありませんが、操作性はやや悪いです。
- （このリポジトリ を自分の GitHub アカウントに Fork する | 既に Fork してる場合は Fetch upstream する（必須））
- → Fork した自分のアカウントの側のリポジトリをブラウザで開き、緑色の「Code」ボタンをクリック
- → 「Create codespace on main」をクリック
- → 「Open this codespace in VS Code Desktop」をクリック
- → ダイアログが数回表示されるので全部 OK っぽい方をクリック
- → VSCode と GitHub を連携させるために認証が求められるので承認する
- → VSCode で GitHub Codespaces に無事に接続できたら、動作確認のために、ターミナルで `make` を実行

これだけで全員同じ環境で開発できるようになるはず。料金は 2022-07-02 現在、無料です。

#### このリポジトリを GitHub であなたのアカウントへ Fork して、 `git clone` する

#### Fork したあなたのリポジトリで、GitHub Codespaces を起動して、Visual Studio Code で開く

[![Image from Gyazo](https://i.gyazo.com/a29c4cce16baca1b33978231849b2269.png)](https://gyazo.com/a29c4cce16baca1b33978231849b2269)
[![Image from Gyazo](https://i.gyazo.com/1351c39a5ac9a4f5a4a4ae9901ec12d6.png)](https://gyazo.com/1351c39a5ac9a4f5a4a4ae9901ec12d6)

#### GitHub Codespaces で動作確認する

```
make
```

#### GitHub Codespaces で API サーバーとして動かす

```
make serve-local
```

- GET http://localhost:50000/spec
- GET http://localhost:50000/entities
- GET http://localhost:50000/variables
- GET http://localhost:50000/parameters

