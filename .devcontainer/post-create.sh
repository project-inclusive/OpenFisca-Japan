#!/usr/bin/env bash
# コンテナ作成時（初回）に一度だけ実行されるセットアップスクリプト。
# （devcontainer.json の postCreateCommand から呼ばれる）
set -euo pipefail

# このスクリプト自身のあるディレクトリ（.devcontainer）
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# 永続化ボリューム上の AI CLI 用ディレクトリを作成・権限調整（この後の install で書き込めるように）
bash "${SCRIPT_DIR}/prepare-agent-dirs.sh"

# Claude Code をインストール（公式の推奨方法であるネイティブインストーラ。
# 失敗時は npm パッケージにフォールバック）。
# feature(ghcr.io/anthropics/devcontainer-features/claude-code) を使わない理由:
# feature は `npm install -g` で nvm 配下に入れるため、コンテナ内での自動更新が
# no_permissions で失敗する（`claude doctor` で確認できる）。ネイティブインストーラは
# ~/.local/bin + ~/.local/share/claude に入れるので user 権限で自動更新できる。
if ! curl -fsSL https://claude.ai/install.sh | bash; then
  echo "Official Claude Code installer failed. Falling back to npm package."
  # sudo は使わない（公式ドキュメントが非推奨。nvm の global ディレクトリは user が書き込み可）
  npm install -g @anthropic-ai/claude-code
fi

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
