## バックエンドOpenFisca Python APIサーバーデプロイ方法

### ローカルでdockerイメージを作りcloud runにデプロイする

- `docker build -t gcr.io/openfisca-shibuya/openfisca-shibuya-deploy-test -f Dockerfile_cloud --platform amd64 .`
M1 Macの場合、`--platform amd64`が必要。

- `docker push gcr.io/openfisca-shibuya/openfisca-shibuya-deploy-test:latest`
でGCPのcontainer registoryに保存される。

- Cloud Runでアップしたdocker imageを選択してデプロイする。

- Makefile内の環境変数は`$hoge`では認識されない。他の記載方法がある？


### その他

- テストパターンCSVの所得 -> テストファイルyamlの収入 -> OpenFiscaの所得　が0.5単位に丸められるため、所得が一致しない可能性がある。  
テストパターンCSVの所得が境界値下なのか上なのか分からないと、収入をどちらに丸めれば良いかわからないため、テストファイルyamlには所得を直接記載する。  
jsonでOpenFisca APIにPOSTするときは途中で算出される値を入力するとエラーになるが、yamlでテストファイルを入力する際はエラーにならない。