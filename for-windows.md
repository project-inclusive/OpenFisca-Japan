# OpenFisca Windows 向けの情報まとめ

## 環境構築のすすめ

### 前提

- https://scrapbox.io/c4j/GitHubでの共同開発への参加の準備
  - Git をセットアップする
  - GitHub にユーザー登録する
  - Docker をセットアップする

### リポジトリを Fork する

GitHub のこのリポジトリを自分のアカウントへ fork する

### fork したリポジトリを Clone する

```
git clone git@github.com:<あなたのGitHub ユーザーネーム>/OpenFisca-japan.git
```

### 環境変数を利用して Python に UTF-8 を強制させる

Unicode Decoding Error が起きるときもこちらの通りにしてください。
Powershell を起動し以下のコマンドを入力して下さい。

```
$env:PYTHONUTF8=1
```

## テストの実行

openfisca のディレクトリに移動し、以下のコマンドを実行

```
docker compose run --rm openfisca maek
```
