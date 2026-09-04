#!/usr/bin/env bash
# コンテナ作成時（初回）に一度だけ実行されるセットアップスクリプト。
# （devcontainer.json の postCreateCommand から呼ばれる）
set -euo pipefail

# このスクリプト自身のあるディレクトリ（.devcontainer）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 永続化ボリューム上の AI CLI 用ディレクトリを作成・権限調整（この後の install で書き込めるように）
bash "${SCRIPT_DIR}/prepare-agent-dirs.sh"

# Codex CLI をインストール（公式インストーラ。失敗時は npm パッケージにフォールバック）
if ! curl -fsSL https://chatgpt.com/codex/install.sh | CODEX_NON_INTERACTIVE=1 sh; then
  echo "Official Codex installer failed. Falling back to npm package."
  sudo npm install -g @openai/codex@latest
fi

# GitHub CLI があれば `gh copilot` 拡張を追加
if command -v gh >/dev/null 2>&1; then
  gh extension install github/gh-copilot --force || true
fi

# リポジトリの tmux 設定を $HOME にシンボリックリンクし、tmux から読み込まれるようにする
TMUX_CONF_SOURCE="${SCRIPT_DIR}/tmux.conf"
if [ -f "$TMUX_CONF_SOURCE" ]; then
  ln -sfn "$TMUX_CONF_SOURCE" "${HOME}/.tmux.conf"
fi
