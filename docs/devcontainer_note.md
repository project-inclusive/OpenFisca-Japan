# Dev Container 開発環境

`.devcontainer/` 以下は、[Dev Container](https://containers.dev/)（VS Code の Dev Containers 拡張、または Dev Container CLI）で開くための開発環境定義です。
`docs/dev_note.md` の `docker-compose` を使った手順とは別に、**コンテナ内で完結してバックエンド・フロントエンドを開発できる環境** を提供します。
Claude Code / Codex / GitHub Copilot CLI といった AI コーディング支援 CLI もあらかじめ組み込まれています。
また、ターミナルベースで開発できるよう **tmux の設定**（コンテナ内の `tmux.conf`、および Mac のホストから接続するためのスクリプト）も含まれています。

## 概要

- ベースイメージは `python:3.11-bookworm`。
- バックエンド(OpenFisca)開発に必要な Python ツール（`autopep8`, `flake8`）と、フロントエンド用の Node.js 18 を同梱。
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

- フロントエンド(30000)・バックエンド(50000)のポートは自動でホストへフォワードされる。
  - フロントエンド起動後は http://localhost:30000/ 、バックエンド起動後は http://localhost:50000/ で確認できる。
  - リモート（Tailscale）からアクセスする場合は [ポート公開（`appPort` / `forwardPorts`）](#ポート公開appport--forwardports) を参照。

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
| `Dockerfile` | ベースイメージと OS パッケージ・Node.js・Python ツールのインストール、非 root ユーザー `user` の作成、`make install && make build` によるバックエンドのセットアップ。 |
| `post-create.sh` | コンテナ作成時（初回）に一度だけ実行。AI CLI のディレクトリ準備、Codex CLI と `gh copilot` のインストール、tmux 設定のシンボリックリンク作成。 |
| `post-start.sh` | コンテナ起動のたびに実行。永続化ボリュームがリセットされた場合に備え、AI CLI のディレクトリ権限を再設定。 |
| `prepare-agent-dirs.sh` | `post-create.sh` / `post-start.sh` から共通で呼ばれ、`~/.claude` `~/.codex` `~/.copilot` の作成・所有権・権限を整える。 |
| `tmux.conf` | コンテナ内 tmux の設定。`post-create.sh` により `~/.tmux.conf` へリンクされる。 |
| `devcontainer-lock.json` | `features` で参照する各 feature のバージョン・ダイジェストの固定（ロックファイル）。 |

## 同梱ツール

`Dockerfile` および `features` により以下がインストールされる。

- **OS パッケージ**: `git`, `curl`, `vim`, `htop`, `jq`, `nkf`（日本語文字コード変換）, `tmux`, `ncurses-term`
- **Docker CLI**（ホストの Docker ソケット経由で利用）
- **Node.js 18**（フロントエンド開発・各種 CLI 用）
- **Python ツール**: `autopep8`, `flake8`
- **GitHub CLI（`gh`）**（`ghcr.io/devcontainers/features/github-cli` feature。`post-create.sh` の `gh copilot` 拡張インストールにも使われる）
- **AI コーディング CLI**
  - Claude Code（`ghcr.io/anthropics/devcontainer-features/claude-code` feature）
  - GitHub Copilot CLI（`ghcr.io/devcontainers/features/copilot-cli` feature、加えて `gh copilot` 拡張）
  - Codex CLI（`post-create.sh` で公式インストーラ、失敗時は npm パッケージにフォールバック）

## 主要な設定のポイント

### ポート公開（`appPort` / `forwardPorts`）

| ポート | 用途 |
| --- | --- |
| 30000 | フロントエンド（Vite 開発サーバー、`npm run dev`） |
| 50000 | バックエンド（`make serve-local` の OpenFisca API サーバー） |

この環境では、ポートの扱いに 3 つの設定が関わる。用途に応じて意味が異なるので注意する。

| 設定 | 実体 | 効果 |
| --- | --- | --- |
| `appPort` | Docker の `-p`（publish）相当。Mac ホスト側にポートを公開する | 本リポジトリでは **`127.0.0.1`（ループバック）限定**で公開する。LAN には晒さず、リモートからは [SSH の `LocalForward` 経由](#リモートから-ssh-で接続するtailscale)でアクセスする |
| `forwardPorts` | VS Code（エディタ）のポートフォワード。基本 `localhost` バインド | VS Code で開いたときのみ有効。`devcontainer up`（CLI）運用では働かない |
| `portsAttributes` | VS Code の UI 用ラベル・通知設定 | VS Code 専用。tmux / CLI 運用では効果はない（付けても害はない） |

`devcontainer.json` の設定:

```jsonc
// Mac ホストの 127.0.0.1 のみに公開（LAN には出さない）
"appPort": ["127.0.0.1:30000:30000", "127.0.0.1:50000:50000"],
```

- **リモートアクセスは SSH の `LocalForward` を使う**（[リモートから SSH で接続する](#リモートから-ssh-で接続するtailscale)参照）。`ssh ofj-tmux` の接続中、クライアントの `http://localhost:30000` / `:50000` が SSH トンネル経由で Mac の `127.0.0.1:30000/50000` に転送される。
  - `LocalForward` の転送先はサーバー（Mac）側で解決されるため、Mac 側は**ループバックだけ開いていれば十分**。LAN（`en0` 等）や Tailscale インターフェースには出さないので、**同一 LAN の他マシンからは見えない**。
- **コンテナ内アプリは `0.0.0.0` で待ち受ける必要がある**（`127.0.0.1` のみだと publish しても届かない）。本リポジトリでは対応済み。
  - フロントエンド: `dashboard/package.json` の `dev` が `vite --port 30000 --host 0.0.0.0`
  - バックエンド: `make serve-local` が `--bind 0.0.0.0:50000`
- `appPort` は **コンテナ作成時**に適用される（`docker run -p` 相当）。あとから追加・変更した場合は、既存の `vsc-openfisca-japan...` コンテナを削除して作り直す（`devcontainer up --remove-existing-container` など）。
- SSH を使わず Mac の Tailscale IP に直接（`http://<mac-tailscale-host>:30000/`）アクセスしたい場合は、`127.0.0.1` 限定ではリモートから届かない。その場合は `appPort` を Tailscale IP 限定（`"100.x.x.x:30000:30000"`）か `0.0.0.0`（＝LAN にも公開）に変更する必要がある。

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

### ロケール（`containerEnv`）

- `LANG` / `LANGUAGE` / `LC_CTYPE` に `ja_JP.UTF-8` 系を設定し、日本語ファイル名・出力の文字化けを防ぐ。
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
exec docker exec -it \
  -u "$exec_user" \
  --detach-keys="ctrl-]" \
  -e HOME="$exec_home" \
  -e TERM="${TERM:-xterm-256color}" \
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

- **`~/.ssh/config` にエイリアス `ofj-tmux` を追加**する。接続スクリプトの起動に加え、`LocalForward` で 30000/50000 をクライアントの `localhost` へ転送する。

  ```
  # ~/.ssh/config （リモート端末側）
  Host ofj-tmux
      HostName mymac.tailXXXX.ts.net   # Tailscale の MagicDNS 名 or 100.x.x.x
      User <username>
      RequestTTY force
      # Mac 上に保存した接続スクリプトを実行（~ はリモート側シェルで展開される）
      RemoteCommand bash ~/bin/connect-devcontainer-tmux.sh
      # フロントエンド/バックエンドのポートをクライアントの localhost へ転送
      LocalForward 30000 localhost:30000
      LocalForward 50000 localhost:50000
      ServerAliveInterval 30
      ServerAliveCountMax 3
  ```

  - `RequestTTY force` … tmux のために TTY を必ず割り当てる。
  - `RemoteCommand` … `~` はリモート（Mac）側のログインシェルで展開されるためフルパスは不要。「tmux でホストから接続する」で保存した場所に合わせる。
  - `LocalForward` … `ssh ofj-tmux` の接続中、クライアントの `http://localhost:30000` / `:50000` が Mac 上に公開されたポート（`appPort`）へ SSH トンネル経由で転送される。Tailscale IP を直接指定せず `localhost` で開けるうえ、通信も SSH で暗号化される。
    - この転送先は Mac の `localhost:30000/50000`。`devcontainer.json` の `appPort` でポートが Mac ホストに公開されている必要がある（[ポート公開](#ポート公開appport--forwardports)参照）。
  - `ServerAliveInterval` / `ServerAliveCountMax` … 無通信で切断されにくくする。

### 3. 接続する

```bash
ssh ofj-tmux
```

- Tailscale 経由で Mac に SSH 接続し、`connect-devcontainer-tmux.sh` が Dev Container の tmux セッションへアタッチする。
- 接続中は `LocalForward` により、クライアントのブラウザから以下を開ける（コンテナ内でフロント／バックエンドを起動しておく）。
  - フロントエンド: http://localhost:30000/
  - バックエンド API: http://localhost:50000/
- キー操作:
  - tmux のデタッチ: `Ctrl-b d`（セッションはコンテナ内に残る）
  - コンテナからのデタッチ: `Ctrl-]`（`--detach-keys`）
- ※ 本リポジトリの `appPort` は `127.0.0.1` 限定公開のため、ポートへのアクセスは上記 `LocalForward` 経由（`localhost`）のみ。Tailscale IP に直接当てたい場合は `appPort` のバインド変更が必要（[ポート公開](#ポート公開appport--forwardports)参照）。

### 補足・トラブルシューティング

- **接続できない／すぐ切れる** … Mac がスリープしていないか（Amphetamine のセッションが有効か）を確認する。省電力設定の「ネットワークアクセスによるスリープ解除（Wake for network access）」も有効にしておくとよい。
- **`ssh: Could not resolve hostname`** … Tailscale がクライアント・Mac 双方で起動し同じ tailnet にいるか、MagicDNS が有効かを `tailscale status` で確認する。IP（`100.x.x.x`）を直接指定しても試せる。
- **接続後すぐ終了する／`Docker Desktop is not running`** … Mac 側で Docker Desktop が起動しているか確認する（ログイン時起動を推奨）。
- **鍵認証で入れずパスワードを求められる** … Mac の「リモートログイン」許可ユーザーと、`~/.ssh/authorized_keys` への公開鍵登録を確認する。

## トラブルシューティング

- **AI CLI のログインがリビルドで消える** … `~/.claude` 等は名前付きボリューム（`openfisca-japan-claude` など）に保存される。`docker volume rm` でボリュームを削除すると認証情報も消えるので注意。
- **コンテナ内で `docker` が使えない / 権限エラー** … Docker Desktop が起動しているか、`/var/run/docker.sock` がマウントされているかを確認する。ソケットの GID 調整は ENTRYPOINT（`docker-init.sh`）で行われる。
- **日本語ファイル名が文字化けする** … `containerEnv` のロケール設定が効いているか確認する。ホスト側ターミナルの文字コードも UTF-8 にする。
- **`connect-devcontainer-tmux.sh` が `devcontainer.json が見つかりません` で止まる** … スクリプト冒頭の `workspace_dir` にローカルの OpenFisca-Japan リポジトリのパスを設定する。
- **`Dev Container CLI is not installed`** … `npm install -g @devcontainers/cli` でインストールする。
