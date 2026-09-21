# Dev Container 開発環境

`.devcontainer/` 以下は、[Dev Container](https://containers.dev/)（VS Code の Dev Containers 拡張、または Dev Container CLI）で開くための開発環境定義です。
アプリ自体は `docs/dev_note.md` と同じく `docker compose up --build` で起動し（Dev Container を使う／使わないで手順を揃える）、その **開発シェル（エディタ・AI CLI・tmux）** を Dev Container として提供します。
Claude Code / Codex / GitHub Copilot CLI といった AI コーディング支援 CLI もあらかじめ組み込まれています。
また、ターミナルベースで開発できるよう **tmux の設定**（コンテナ内の `tmux.conf`、および Mac のホストから接続するためのスクリプト）も含まれています。

## 概要

- ベースイメージは `python:3.11-bookworm`。
- バックエンド(OpenFisca)開発に必要な Python ツール（`autopep8`, `flake8`）と、フロントエンド用の Node.js 26 を同梱。
- 非 root ユーザー `user` で動作し、ホストの Docker ソケットをマウントしてコンテナ内から `docker` コマンドを利用可能（docker-from-docker）。
- 日本語ロケール（`ja_JP.UTF-8`）を設定済み。
- Claude Code / Codex / GitHub Copilot CLI の設定・認証情報は名前付きボリュームに永続化され、リビルドしても保持される。

## 前提条件

- Docker Desktop をインストールして起動しておく（`docs/dev_note.md` の[環境構築](./dev_note.md#環境構築)参照）。
- 次のいずれかの方法で開く。
  - **VS Code** + [Dev Containers 拡張](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
  - **Dev Container CLI**（`npm install -g @devcontainers/cli`）

## 起動方法

### VS Code で開く

1. クローンした OpenFisca-Japan のディレクトリを VS Code で開く。
2. コマンドパレット（`F1`）から `Dev Containers: Reopen in Container` を実行する。
3. 初回はイメージのビルドと `postCreateCommand` の実行が走るため数分かかる。完了後、コンテナ内のターミナルで開発できる。

- アプリの起動は `docker compose up --build`（`docs/dev_note.md` と同じ手順）。ポートは Dev Container ではなく **ホスト（Mac）側に公開** される。
  - フロントエンド http://localhost:30000/ 、バックエンド http://localhost:50000/ 、Swagger UI http://localhost:8080/ で確認できる。
  - リモート（Tailscale）や LAN からアクセスする場合は [ポート公開（`docker compose`）](#ポート公開docker-compose) を参照。

### Dev Container CLI で起動

VS Code を使わずコンテナだけ起動したい場合に利用する。

```bash
# リポジトリのルートで実行
devcontainer up --workspace-folder .

# 起動済みコンテナ内でコマンドを実行する例
devcontainer exec --workspace-folder . bash
```

## ファイル構成

`.devcontainer/` 以下の各ファイルの役割は次の通り。

| ファイル | 役割 |
| --- | --- |
| `devcontainer.json` | Dev Container の本体設定（ビルド方法・ポート・マウント・環境変数・VS Code 拡張／設定・features）。 |
| `Dockerfile` | ベースイメージと OS パッケージ・Python ツールのインストール、非 root ユーザー `user` の作成、`make install && make build` によるバックエンドのセットアップ。 |
| `post-create.sh` | コンテナ作成時（初回）に一度だけ実行。AI CLI のディレクトリ準備、Codex CLI と `gh copilot` のインストール、tmux 設定のシンボリックリンク作成。 |
| `post-start.sh` | コンテナ起動のたびに実行。永続化ボリュームがリセットされた場合に備え、AI CLI のディレクトリ権限を再設定。 |
| `prepare-agent-dirs.sh` | `post-create.sh` / `post-start.sh` から共通で呼ばれ、`~/.claude` `~/.codex` `~/.copilot` `~/.config/git` の作成・所有権・権限を整える。 |
| `tmux.conf` | コンテナ内 tmux の設定。`post-create.sh` により `~/.tmux.conf` へリンクされる。tmux セッション内では `DOCKER_CONFIG` を専用ディレクトリに切り替え、Dev Containers の docker 認証ヘルパー（VS Code 接続時のみ有効）を回避する。 |
| `devcontainer-lock.json` | `features` で参照する各 feature のバージョン・ダイジェストの固定（ロックファイル）。 |

## 同梱ツール

`Dockerfile` および `features` により以下がインストールされる。

- **OS パッケージ**: `git`, `curl`, `vim`, `htop`, `jq`, `nkf`（日本語文字コード変換）, `tmux`, `ncurses-term`
- **Docker CLI**（ホストの Docker ソケット経由で利用）
- **Node.js 26**（`ghcr.io/devcontainers/features/node` feature。フロントエンド開発・各種 CLI 用）
- **Python ツール**: `autopep8`, `flake8`
- **GitHub CLI（`gh`）**（`ghcr.io/devcontainers/features/github-cli` feature。`post-create.sh` の `gh copilot` 拡張インストールにも使われる）
- **AI コーディング CLI**
  - Claude Code（`ghcr.io/anthropics/devcontainer-features/claude-code` feature）
  - GitHub Copilot CLI（`ghcr.io/devcontainers/features/copilot-cli` feature、加えて `gh copilot` 拡張）
  - Codex CLI（`post-create.sh` で公式インストーラ、失敗時は npm パッケージにフォールバック）

## 主要な設定のポイント

### ポート公開（`docker compose`）

| ポート | 用途 |
| --- | --- |
| 30000 | フロントエンド（Vite 開発サーバー、`dashboard` サービス） |
| 50000 | バックエンド（OpenFisca API、`openfisca` サービス） |
| 8080 | Swagger UI（`swagger-ui` サービス） |

アプリは `docs/dev_note.md` と同様に **`docker compose up --build` で起動する**（Dev Container を使う場合も使わない場合も手順は同じ）。Dev Container 内から実行しても、ホストの Docker ソケット経由（docker-from-docker）で **ホストの Docker デーモン上に兄弟コンテナとして起動** するため、ポートは Dev Container ではなく **ホスト（Mac）側に公開** される。

- `docker-compose.yml` の `ports:` はバインドアドレスを指定していないため、**全インターフェース（`0.0.0.0`）に公開** される。したがって `localhost` だけでなく、**同一 LAN や Tailscale の別端末からも** `http://<host>:30000/` 等で直接アクセスできる。
  - リモート（Tailscale）から見るときは `http://<mac-tailscale-host>:30000/`（MagicDNS 名または `100.x.x.x`）。SSH トンネルは不要だが、`localhost` で開きたい／通信を SSH で暗号化したい場合は [SSH の `LocalForward`](#リモートから-ssh-で接続するtailscale) も併用できる。
- **Dev Container 側でポートを掴まないよう、`devcontainer.json` に `appPort` / `forwardPorts` / `portsAttributes` は設定していない。**
  - `appPort` を設定すると Dev Container がホストの 30000/50000 を先に確保してしまい、`docker compose up` が `Bind for 0.0.0.0:30000 failed: port is already allocated` で失敗する。
  - `forwardPorts` / `portsAttributes` は VS Code エディタのフォワード・UI 用で、`docker compose` でホストに publish する本運用では不要（`devcontainer up`／tmux 運用では元々効かない）。
  - `appPort` は **コンテナ作成時** に適用される（`docker run -p` 相当）。以前設定していた場合、削除を反映するには既に起動中のコンテナを作り直す（`devcontainer up --remove-existing-container` など）。
- **コンテナ内アプリは `0.0.0.0` で待ち受ける**（対応済み）。
  - フロントエンド: `dashboard/package.json` の `dev` が `vite --port 30000 --host 0.0.0.0`
  - バックエンド: `make serve-local` が `--bind 0.0.0.0:50000`
- Dev Container の tmux/SSH ターミナルから `docker compose up --build` を実行する場合、`DOCKER_CONFIG`（認証ヘルパー回避）と `LOCAL_WORKSPACE_FOLDER`（バインドマウント元のホストパス）が必要。詳細は[トラブルシューティング](#トラブルシューティング)を参照（`tmux.conf` と接続スクリプトで自動設定済み）。

### コンテナの常駐と停止（`shutdownAction`）

このコンテナは **一度起動すると常駐** し、**停止はユーザーが明示的に行う** 運用です。

- `devcontainer.json` で `"shutdownAction": "none"` を指定しているため、**VS Code のウィンドウを閉じてもコンテナは停止しない**。また `Dockerfile` の `CMD ["sleep", "infinity"]` により、中でプロセスを起動していなくてもコンテナは動き続ける。
- そのため、いったん `devcontainer up` / VS Code で起動すれば、Mac を再起動する（または下記で明示的に停止する）まで起動したままになる。tmux セッションもコンテナ内に残るので、`ssh ofj-tmux` などで**いつでも再接続**できる（Mac 常時起動 + Tailscale のリモート運用と相性が良い）。
- **停止・削除はユーザーが Docker コマンドで行う**（自動では止まらない）。

  ```bash
  # コンテナ名を確認（vsc-openfisca-japan... ）
  docker ps

  # 停止（次回また起動して使う場合）
  docker stop <container_name>

  # 破棄（作り直したい場合。appPort などの設定変更を反映するときはこちら）
  docker rm -f <container_name>
  ```

  - 停止したコンテナは VS Code の「Reopen in Container」や `devcontainer up` で再開できる。
  - `~/.claude` などの設定は名前付きボリュームに残るため、`docker rm` してもログイン状態は保持される（ボリューム自体を消さない限り）。

### マウント・永続化ボリューム（`mounts`）

- `/var/run/docker.sock` … ホストの Docker ソケットをバインドし、コンテナ内から `docker` を実行できるようにする（docker-from-docker）。
- `openfisca-japan-claude` → `~/.claude`、`openfisca-japan-codex` → `~/.codex`、`openfisca-japan-copilot` → `~/.copilot` … 各 AI CLI の設定・認証情報を名前付きボリュームに保存し、**コンテナをリビルドしてもログイン状態などを保持** する。
- `openfisca-japan-gitconfig` → `~/.config/git` … `git config --global`（`user.name` / `user.email` や `safe.directory` など）の保存先。**コンテナをリビルドしても git の設定を保持** する。

### ロケール・git 設定（`containerEnv`）

- `LANG` / `LANGUAGE` / `LC_CTYPE` に `ja_JP.UTF-8` 系を設定し、日本語ファイル名・出力の文字化けを防ぐ。
- `GIT_CONFIG_GLOBAL` に `~/.config/git/config`（上記の永続化ボリューム上のパス）を指定し、`git config --global` の読み書き先を既定の `~/.gitconfig` からこちらに固定している。`~/.gitconfig` はコンテナのファイルシステム上にしかないためリビルドで消えてしまうが、この設定によりリビルドしても `git config --global user.name` 等を保持できる。
- `COPILOT_HOME` を `~/.copilot` に固定し、上記ボリュームに設定が保存されるようにしている。

### コンテナ内ユーザー（`remoteUser`）

- 非 root の `user`（`Dockerfile` で `useradd` により作成）で動作する。
- `docker.sock` の GID にあわせてグループを調整する処理を `Dockerfile` の `docker-init.sh`（ENTRYPOINT）で行っている。

### VS Code のカスタマイズ（`customizations.vscode`）

- 既定ターミナルを bash に設定、保存時フォーマット（`editor.formatOnSave`）を有効化。
- Python の lint / format 設定は `setup.cfg` の `[flake8]` を正とし、`devcontainer.json` 側では重複させていない。
- 日本語言語パック、Python、Docker、Prettier、Git Graph、Claude Code、GitHub Copilot、ChatGPT などの拡張を自動インストールする。

## tmux でホストから接続する（Mac）

VS Code を使わず、**Mac のホストターミナルから** Dev Container を起動してコンテナ内の tmux セッションへ接続したい場合は、以下のスクリプトを使います。

このスクリプトは各自のローカル環境（Node の bin パスなど）に依存する個人用途のものなので、**リポジトリでは管理していません**。下記の内容を Mac 上の任意の場所（例: `~/bin/connect-devcontainer-tmux.sh`）に保存して使ってください。
保存したら、**スクリプト冒頭の設定変数（`===== 各自の環境に合わせて編集する設定 =====` の部分）を自分の環境に合わせて直接書き換えて**ください。`<username>` は自分の Mac のユーザー名に読み替えます。

```bash
#!/usr/bin/env bash
set -euo pipefail

# ===== 各自の環境に合わせて編集する設定（以下の値はサンプル。自分の環境に合わせて変更する）=====
# コンテナ内のワークスペースのパス（通常は変更不要）
container_workspace_dir="/workspaces/OpenFisca-Japan"
# ローカル（Mac）上の OpenFisca-Japan リポジトリのパス
workspace_dir="$HOME/workspaces/openfisca-japan-workspace/OpenFisca-Japan"
# 対象コンテナ（vsc-<prefix>...）を特定するためのプレフィックス
container_prefix="openfisca-japan"
# アタッチする tmux セッション名
tmux_session_name="openfisca-japan"
# Mac で使っている Node / Dev Container CLI の bin ディレクトリ（<username> は自分のユーザー名に）
node_bin_dir="/Users/<username>/.local/share/mise/installs/node/24/bin"

# ===== PATH の準備 =====
# Node / Homebrew の bin を PATH の先頭に追加（node_bin_dir は存在する場合のみ）
extra_paths="/opt/homebrew/bin:/usr/local/bin"
[ -d "$node_bin_dir" ] && extra_paths="$node_bin_dir:$extra_paths"
export PATH="$extra_paths:$PATH"

# ===== ヘルパー関数 =====
# エラーメッセージを標準エラーに出して終了する
die() {
  echo "$@" >&2
  exit 1
}

# 指定したコマンドが無ければメッセージを出して終了する
require_command() {
  command -v "$1" >/dev/null 2>&1 || die "$2"
}

# 起動中のコンテナから、イメージ名が vsc-<prefix>... のものを1つ探す
find_container() {
  docker ps --format '{{.Names}}\t{{.Image}}' \
    | awk -v prefix="$container_prefix" '$2 ~ ("^vsc-" prefix) {print $1; exit}'
}

# ===== 事前チェック =====
# ローカルに OpenFisca-Japan リポジトリ（devcontainer.json）が存在するか
if [ ! -f "$workspace_dir/.devcontainer/devcontainer.json" ]; then
  echo "devcontainer.json が見つかりません: $workspace_dir" >&2
  die "workspace_dir にローカルの OpenFisca-Japan リポジトリのパスを設定してください。"
fi

# 必要なコマンドと Docker の起動状態を確認
require_command devcontainer "Dev Container CLI がありません。実行: npm install -g @devcontainers/cli"
require_command docker "docker コマンドがありません。先に Docker Desktop をインストールしてください。"
docker info >/dev/null 2>&1 || die "Docker Desktop が起動していません。"

# ===== コンテナの起動（未起動なら up）=====
container_name="$(find_container)"

# 見つからなければ devcontainer up で起動して、もう一度探す
if [ -z "$container_name" ]; then
  echo "$container_prefix の Dev Container を起動しています..." >&2
  devcontainer up --workspace-folder "$workspace_dir" >/dev/null
  container_name="$(find_container)"
fi

# それでも見つからなければ失敗
[ -n "$container_name" ] || die "$container_prefix の Dev Container を起動できませんでした。"

# ===== 実行ユーザーと HOME =====
# devcontainer の remoteUser=user 前提（user が居なければ以降の docker exec が失敗して終了する）
exec_user="user"
exec_home="/home/user"

# 解決したユーザー・HOME でコンテナ内コマンドを実行するヘルパー
dexec() {
  docker exec -u "$exec_user" -e HOME="$exec_home" "$container_name" "$@"
}

# ===== Git の safe.directory をグローバル設定に登録（未登録時のみ）=====
if ! dexec git config --global --get-all safe.directory 2>/dev/null \
  | grep -Fx "$container_workspace_dir" >/dev/null; then
  dexec git config --global --add safe.directory "$container_workspace_dir" >/dev/null
fi

# ===== コンテナに入り tmux セッションへアタッチ =====
# Backspace(^H/^?)の不一致は /etc/inputrc 側の二重バインドで吸収するため、
# ここで stty erase を無理に固定しない（ホストによって送る文字が違い、固定すると逆に合わない場合がある）。
# -it: 対話端末を割り当て / --detach-keys=ctrl-]: コンテナからデタッチするキー
# LOCAL_WORKSPACE_FOLDER: docker-from-docker で `docker compose` のバインドマウント元に
#   ホスト側の実パスが必要なため注入する（workspace_dir はホスト上のリポジトリパス）。
exec docker exec -it \
  -u "$exec_user" \
  --detach-keys="ctrl-]" \
  -e HOME="$exec_home" \
  -e TERM="${TERM:-xterm-256color}" \
  -e LOCAL_WORKSPACE_FOLDER="$workspace_dir" \
  -w "$container_workspace_dir" "$container_name" \
  bash -lc 'tmux source-file "$HOME/.tmux.conf" 2>/dev/null || true; exec tmux -u new-session -A -s "'"$tmux_session_name"'"'
```

保存したら実行権限を付けて起動します（保存先は例です。各自のパスに読み替えてください）。

```bash
chmod +x ~/bin/connect-devcontainer-tmux.sh
~/bin/connect-devcontainer-tmux.sh
```

このスクリプトの動作は次の通りです。

1. ローカルの OpenFisca-Japan リポジトリと Docker Desktop / Dev Container CLI の存在を確認する（`Preflight checks`）。
2. 対象の Dev Container が未起動なら `devcontainer up` で起動する（`Locate (or start) the devcontainer`）。
3. コンテナ内の `git config --global safe.directory` を（未登録時のみ）設定する。
4. コンテナへ入り、`tmux` セッション（既定名 `openfisca-japan`）へアタッチ（無ければ新規作成）する。

スクリプト冒頭（`===== 各自の環境に合わせて編集する設定 =====`）で書き換える変数は次の通りです。

| 変数 | 例 | 説明 |
| --- | --- | --- |
| `workspace_dir` | `$HOME/workspaces/openfisca-japan-workspace/OpenFisca-Japan` | ローカル（Mac）の OpenFisca-Japan リポジトリのパス |
| `container_workspace_dir` | `/workspaces/OpenFisca-Japan` | コンテナ内のワークスペースパス（通常は変更不要） |
| `container_prefix` | `openfisca-japan` | 対象コンテナ（`vsc-<prefix>...`）を特定するプレフィックス |
| `tmux_session_name` | `openfisca-japan` | アタッチする tmux セッション名 |
| `node_bin_dir` | `/Users/<username>/.local/share/mise/installs/node/24/bin` | `PATH` の先頭に追加する Node/Dev Container CLI の bin ディレクトリ（存在する場合のみ追加） |

- `Ctrl-]` でコンテナからデタッチできる（スクリプト末尾の `--detach-keys`）。
- Backspace キーの `^H` / `^?` 差異は `Dockerfile` の `/etc/inputrc` で両方バインドして吸収しているため、スクリプト側で `stty erase` を固定していない。

## リモートから SSH で接続する（Tailscale）

外出先などのリモート端末から、常時起動しておいた Mac 上の Dev Container の tmux セッションへ、`ssh ofj-tmux` の一発で接続するための設定です。

```
[リモート端末] --(Tailscale)--> [Mac（Amphetamine で常時起動）]
                                  └─ ssh 実行時に connect-devcontainer-tmux.sh を起動
                                       └─ Dev Container 内の tmux セッションへアタッチ
```

回線が切れても tmux セッションはコンテナ内に残るため、再度 `ssh ofj-tmux` で作業を再開できます。

### 1. Mac 側（ホスト）の準備

- **Amphetamine で常時起動**
  - [Amphetamine](https://apps.apple.com/app/amphetamine/id937984704)（Mac App Store）をインストールし、セッションを開始してスリープ／ディスプレイスリープを無効化する。
  - クラムシェル（画面を閉じた状態）でも起動を維持したい場合は Amphetamine の「Allow closed-display mode」等を設定する。
- **リモートログイン（SSH）を有効化**
  - システム設定 → 一般 → 共有 → **リモートログイン** をオンにする。
  - 「アクセスを許可するユーザー」に自分のアカウントを含める。
- **Tailscale をインストールしてログイン**
  - `brew install --cask tailscale` または App Store 版をインストールし、リモート端末と**同じ tailnet** にログインする。
  - `tailscale status` で Mac の MagicDNS 名（例: `mymac.tailXXXX.ts.net`）または Tailscale IP（`100.x.x.x`）を控える。
- **Docker Desktop を「ログイン時に起動」に設定**しておくと、Mac 再起動後も自動でコンテナを起動できる状態になる。

### 2. リモート端末（クライアント）の準備

- **Tailscale をインストール・ログイン**（Mac と同じ tailnet）。
- **SSH 公開鍵を Mac に登録**する。

  ```bash
  ssh-copy-id <username>@<mac-tailscale-host>
  ```

- **`~/.ssh/config` にエイリアス `ofj-tmux` を追加**する。tmux 接続には接続スクリプトの起動だけで十分。`LocalForward` は任意（Web ページは Tailscale 経由で `http://<mac-tailscale-host>:30000/` に直接アクセスできる。`localhost` で開きたい／SSH で暗号化したい場合のみ付ける）。

  ```
  # ~/.ssh/config （リモート端末側）
  Host ofj-tmux
      HostName mymac.tailXXXX.ts.net   # Tailscale の MagicDNS 名 or 100.x.x.x
      User <username>
      RequestTTY force
      # Mac 上に保存した接続スクリプトを実行（~ はリモート側シェルで展開される）
      RemoteCommand bash ~/bin/connect-devcontainer-tmux.sh
      # （任意）フロントエンド/バックエンドを localhost で開きたい場合のみ
      LocalForward 30000 localhost:30000
      LocalForward 50000 localhost:50000
      ServerAliveInterval 30
      ServerAliveCountMax 3
  ```

  - `RequestTTY force` … tmux のために TTY を必ず割り当てる。
  - `RemoteCommand` … `~` はリモート（Mac）側のログインシェルで展開されるためフルパスは不要。「tmux でホストから接続する」で保存した場所に合わせる。
  - `LocalForward`（任意） … `ssh ofj-tmux` の接続中、クライアントの `http://localhost:30000` / `:50000` が Mac 上のポートへ SSH トンネル経由で転送される。`docker compose` はホストの `0.0.0.0`（=`127.0.0.1` を含む）に publish しているため、転送先 `localhost:30000/50000` に届く。`localhost` で開けて通信も暗号化される反面、Tailscale 直アクセスで足りるなら省略してよい。
  - `ServerAliveInterval` / `ServerAliveCountMax` … 無通信で切断されにくくする。

### 3. 接続する

```bash
ssh ofj-tmux
```

- Tailscale 経由で Mac に SSH 接続し、`connect-devcontainer-tmux.sh` が Dev Container の tmux セッションへアタッチする。
- あらかじめ `docker compose up --build` でアプリを起動しておけば、クライアントのブラウザから以下を開ける。
  - Tailscale 直アクセス: `http://<mac-tailscale-host>:30000/` / `:50000/`（`docker compose` がホストの `0.0.0.0` に publish）。
  - `LocalForward` を設定した場合は http://localhost:30000/ / http://localhost:50000/ でも開ける。
- キー操作:
  - tmux のデタッチ: `Ctrl-b d`（セッションはコンテナ内に残る）
  - コンテナからのデタッチ: `Ctrl-]`（`--detach-keys`）
- ※ ポートは `docker compose` がホストの `0.0.0.0` に publish する（LAN・Tailscale に公開される）。詳細は[ポート公開（`docker compose`）](#ポート公開docker-compose)を参照。

### 補足・トラブルシューティング

- **接続できない／すぐ切れる** … Mac がスリープしていないか（Amphetamine のセッションが有効か）を確認する。省電力設定の「ネットワークアクセスによるスリープ解除（Wake for network access）」も有効にしておくとよい。
- **`ssh: Could not resolve hostname`** … Tailscale がクライアント・Mac 双方で起動し同じ tailnet にいるか、MagicDNS が有効かを `tailscale status` で確認する。IP（`100.x.x.x`）を直接指定しても試せる。
- **接続後すぐ終了する／`Docker Desktop is not running`** … Mac 側で Docker Desktop が起動しているか確認する（ログイン時起動を推奨）。
- **鍵認証で入れずパスワードを求められる** … Mac の「リモートログイン」許可ユーザーと、`~/.ssh/authorized_keys` への公開鍵登録を確認する。

## トラブルシューティング

- **AI CLI のログインがリビルドで消える** … `~/.claude` 等は名前付きボリューム（`openfisca-japan-claude` など）に保存される。`docker volume rm` でボリュームを削除すると認証情報も消えるので注意。
- **`git config --global user.name` / `user.email` がリビルドで消える** … `openfisca-japan-gitconfig` ボリューム（`~/.config/git`、`GIT_CONFIG_GLOBAL` で参照）に保存されるため、通常はリビルドしても保持される。それでも消える場合は `docker volume ls` でボリュームが存在するか、`echo $GIT_CONFIG_GLOBAL` が `/home/user/.config/git/config` を指しているかを確認する。
- **コンテナ内で `docker` が使えない / 権限エラー** … Docker Desktop が起動しているか、`/var/run/docker.sock` がマウントされているかを確認する。ソケットの GID 調整は ENTRYPOINT（`docker-init.sh`）で行われる。
- **`docker compose up --build` 等が `error getting credentials - err: exit status 255` で失敗する** … Dev Containers が仕込む docker 認証ヘルパー（`~/.docker/config.json` の `credsStore: dev-containers-*`）は VS Code アタッチ時のみ有効で、tmux/SSH 経由の docker では失敗する（公開イメージの取得も巻き込まれる）。`tmux.conf` で tmux セッション内の `DOCKER_CONFIG` を専用ディレクトリに切り替えて回避している。
  - **既に起動中の tmux セッション**では設定が反映されないため、新しいウィンドウ／ペインを開く（`Ctrl-b c`）か、手動で `export DOCKER_CONFIG="$(mktemp -d)"` してから実行する。
  - 認証が必要なプライベートレジストリを使う場合は、その `DOCKER_CONFIG` 先で `docker login` する。
- **`docker compose up` が `mounts denied: The path ... is not shared from the host` で失敗する** … docker-from-docker では `docker compose` のバインドマウント元が**ホスト(Mac)側で解釈**される。`docker-compose.yml` は `${LOCAL_WORKSPACE_FOLDER:-.}` を使っており、`LOCAL_WORKSPACE_FOLDER`（ホスト上のリポジトリパス）が未設定だとコンテナ内パス（`/workspaces/...`）が渡されて失敗する。接続スクリプト（`connect-devcontainer-tmux.sh`）が `-e LOCAL_WORKSPACE_FOLDER="$workspace_dir"` で注入する。
  - 手動で実行する場合は `export LOCAL_WORKSPACE_FOLDER=<ホスト上のリポジトリの絶対パス>` してから `docker compose up`。
  - ホスト側の実パスは `docker inspect -f '{{range .Mounts}}{{.Source}} => {{.Destination}}{{"\n"}}{{end}}' "$(hostname)"` で確認できる。
- **日本語ファイル名が文字化けする** … `containerEnv` のロケール設定が効いているか確認する。ホスト側ターミナルの文字コードも UTF-8 にする。
- **`connect-devcontainer-tmux.sh` が `devcontainer.json が見つかりません` で止まる** … スクリプト冒頭の `workspace_dir` にローカルの OpenFisca-Japan リポジトリのパスを設定する。
- **`Dev Container CLI is not installed`** … `npm install -g @devcontainers/cli` でインストールする。
- **ターミナルで文字がコピーできない** … tmux 上では通常のマウス選択やコピー操作が効かないことがある。
  - **Mac**: tmux はデフォルトでマウス操作を tmux 自身が奪うモード（アプリケーションモード）になっており、この状態ではマウスでドラッグしてもテキスト選択ではなく tmux のペイン操作として扱われてしまう。`Cmd+R` を押すとこのモードをトグル（オン/オフ）で切り替えられる。コピーしたいときは `Cmd+R` を押してモードを解除し、通常のターミナルと同じようにマウスでドラッグして選択・コピーする。選択が終わったら、再度 `Cmd+R` を押してモードを戻せば tmux のマウス操作（ペイン切り替えなど）に戻る。
  - **Windows**: `Shift+Ctrl+C`（コピー）/ `Shift+Ctrl+X`（カット）/ `Shift+Ctrl+V`（ペースト）を使用する（`Ctrl+C`はプロセスの中断に割り当てられているため）。
